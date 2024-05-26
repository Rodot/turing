"use client";

import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { v4 } from "uuid";
import { useVisible } from "./useVisible";

export type TableProps = {
  tableName?: string;
  filterColumn?: string;
  filterValue?: string;
};

export function useTable<T extends { id: string }>(
  supabase: SupabaseClient,
  props: TableProps
) {
  const isVisible = useVisible();
  const [store, setStore] = useState<T[]>([]);
  const [disconnected, setDisconnected] = useState(true);

  useEffect(() => {
    const reload = async () => {
      if (!props.filterColumn || !props.tableName) return;
      const { data, error } = await supabase
        .from(props.tableName)
        .select("*")
        .eq(props.filterColumn, props.filterValue)
        .order("created_at", { ascending: true });
      if (error) throw new Error("Error fetching data:" + error.message);
      setStore(data);
    };

    if (!isVisible) return;
    if (!props.tableName || !props.filterColumn || !props.filterValue) {
      setStore([]);
      return;
    }
    setDisconnected(false);

    const channel = supabase
      .channel(v4())
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: props.tableName,
          filter: `${props.filterColumn}=eq.${props.filterValue}`,
        },
        (payload) => {
          reload();
          // wont work if some event don't arrive in the right order or get lost
          // setStore((prev) => [...prev, payload.new as T]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: props.tableName,
          // filter will prevent triggering update on row that match the filter after update
          // filter: `${props.filterColumn}=eq.${props.filterValue}`,
        },
        (payload) => {
          const column = props.filterColumn;
          const value = props.filterValue;
          if (!column || !value) return;
          if (payload.new[column] === value || payload.old[column] === value) {
            reload();
          }
          // wont work for items that were not in the store before the update because of the filter
          // setStore((prev) =>
          //   prev.map((item) =>
          //     item.id === payload.new.id ? (payload.new as T) : item
          //   )
          // );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: props.tableName,
        },
        (payload) => {
          reload();
          // delete events are not filterable https://supabase.com/docs/guides/realtime/postgres-changes#delete-events-are-not-filterable
          // setStore((prev) => {
          //   return prev.filter((item) => item?.id !== payload.old?.id);
          // });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          reload();
        } else {
          setDisconnected(true);
        }
      });

    // cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    isVisible,
    disconnected,
    props.tableName,
    props.filterColumn,
    props.filterValue,
    supabase,
  ]);

  return store;
}
