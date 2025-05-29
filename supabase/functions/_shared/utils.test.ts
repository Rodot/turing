import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { cleanAnswer } from "./utils.ts";

Deno.test("cleanAnswer - removes commas", () => {
  assertEquals(cleanAnswer("Hello, world"), "hello world");
  assertEquals(cleanAnswer("Yes, I think so"), "yes i think so");
  assertEquals(cleanAnswer("No, that's wrong"), "no that's wrong");
  assertEquals(cleanAnswer("A, B, C, D"), "a b c d");
  assertEquals(cleanAnswer(",,,test,,,"), "test");
});

Deno.test("cleanAnswer - trims whitespace and converts to lowercase", () => {
  assertEquals(cleanAnswer("  HELLO WORLD  "), "hello world");
  assertEquals(cleanAnswer("\t\nTest\t\n"), "test");
  assertEquals(cleanAnswer("   MiXeD cAsE   "), "mixed case");
});

Deno.test("cleanAnswer - removes surrounding quotes", () => {
  assertEquals(cleanAnswer('"Hello World"'), "hello world");
  assertEquals(cleanAnswer("'Hello World'"), "hello world");
  assertEquals(cleanAnswer("`Hello World`"), "hello world");
  assertEquals(cleanAnswer('"nested "quotes" here"'), 'nested "quotes" here');
});

Deno.test("cleanAnswer - removes leading ellipsis", () => {
  assertEquals(cleanAnswer("...Hello World"), "hello world");
  assertEquals(cleanAnswer("...test message"), "test message");
  assertEquals(cleanAnswer("..."), "");
});

Deno.test("cleanAnswer - removes trailing ellipsis", () => {
  assertEquals(cleanAnswer("Hello World..."), "hello world");
  assertEquals(cleanAnswer("test message..."), "test message");
  assertEquals(cleanAnswer("..."), "");
});

Deno.test("cleanAnswer - removes trailing period", () => {
  assertEquals(cleanAnswer("Hello World."), "hello world");
  assertEquals(cleanAnswer("Test message."), "test message");
  assertEquals(cleanAnswer("."), "");
});

Deno.test("cleanAnswer - removes em dashes", () => {
  assertEquals(cleanAnswer("Hello—World"), "helloworld");
  assertEquals(cleanAnswer("Test—message—here"), "testmessagehere");
  assertEquals(cleanAnswer("—start and end—"), "start and end");
});

Deno.test("cleanAnswer - normalizes multiple spaces", () => {
  assertEquals(cleanAnswer("hello   world"), "hello world");
  assertEquals(
    cleanAnswer("test    multiple     spaces"),
    "test multiple spaces",
  );
  assertEquals(cleanAnswer("  a   b   c  "), "a b c");
  assertEquals(cleanAnswer("hello\t\n\r  world"), "hello world");
});

Deno.test("cleanAnswer - handles complex combinations", () => {
  assertEquals(cleanAnswer('  "Hello, World—test..."  '), "hello worldtest");
  assertEquals(
    cleanAnswer("'...Yes, I think so—maybe.'"),
    "yes i think somaybe",
  );
  assertEquals(cleanAnswer("`...No, that's—wrong...`"), "no that'swrong");
});

Deno.test("cleanAnswer - iterative cleaning", () => {
  assertEquals(cleanAnswer('""\'test,  message...\'""'), "test message");
  assertEquals(cleanAnswer("'\"...hello,   world...\"'"), "hello world");
  assertEquals(cleanAnswer('"""...test—case,   here..."""'), "testcase here");
});

Deno.test("cleanAnswer - handles edge cases", () => {
  assertEquals(cleanAnswer(""), "");
  assertEquals(cleanAnswer("   "), "");
  assertEquals(cleanAnswer("a"), "a");
  assertEquals(cleanAnswer(","), "");
  assertEquals(cleanAnswer("—"), "");
});

Deno.test("cleanAnswer - preserves internal punctuation", () => {
  assertEquals(cleanAnswer("Don't do that"), "don't do that");
  assertEquals(cleanAnswer("It's working"), "it's working");
  assertEquals(cleanAnswer("What? Really!"), "what? really!");
});
