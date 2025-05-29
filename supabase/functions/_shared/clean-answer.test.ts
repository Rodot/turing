import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { cleanAnswer } from "./clean-answer.ts";

Deno.test("cleanAnswer - removes commas", () => {
  assertEquals(cleanAnswer("Hello, world"), "hello world");
  assertEquals(cleanAnswer("Yes, I think so"), "yes i think so");
  assertEquals(cleanAnswer("No, that's wrong"), "no thats wrong");
  assertEquals(cleanAnswer("A, B, C, D"), "a b c d");
  assertEquals(cleanAnswer(",,,test,,,"), "test");
});

Deno.test("cleanAnswer - trims whitespace and converts to lowercase", () => {
  assertEquals(cleanAnswer("  HELLO WORLD  "), "hello world");
  assertEquals(cleanAnswer("\t\nTest\t\n"), "test");
  assertEquals(cleanAnswer("   MiXeD cAsE   "), "mixed case");
});

Deno.test("cleanAnswer - removes all quotes", () => {
  assertEquals(cleanAnswer('"Hello World"'), "hello world");
  assertEquals(cleanAnswer("'Hello World'"), "hello world");
  assertEquals(cleanAnswer("`Hello World`"), "hello world");
  assertEquals(cleanAnswer('"nested "quotes" here"'), "nested quotes here");
  assertEquals(cleanAnswer("don't can't won't"), "dont cant wont");
  assertEquals(
    cleanAnswer('He said "yes" and she said "no"'),
    "he said yes and she said no",
  );
  assertEquals(cleanAnswer("It's a 'test' message"), "its a test message");
});

Deno.test("cleanAnswer - removes all periods", () => {
  assertEquals(cleanAnswer("Hello World."), "hello world");
  assertEquals(cleanAnswer("Test message."), "test message");
  assertEquals(cleanAnswer("Dr. Smith"), "dr smith");
  assertEquals(cleanAnswer("U.S.A."), "usa");
  assertEquals(cleanAnswer("...test.with.dots..."), "testwithdots");
  assertEquals(cleanAnswer("Period.in.middle."), "periodinmiddle");
  assertEquals(cleanAnswer("."), "");
  assertEquals(cleanAnswer("..."), "");
  assertEquals(cleanAnswer("...Hello World"), "hello world");
  assertEquals(cleanAnswer("Hello World..."), "hello world");
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
  assertEquals(cleanAnswer("`...No, that's—wrong...`"), "no thatswrong");
  assertEquals(cleanAnswer("Dr. John Smith..."), "dr john smith");
});

Deno.test("cleanAnswer - iterative cleaning", () => {
  assertEquals(cleanAnswer('""\'test,  message...\'""'), "test message");
  assertEquals(cleanAnswer("'\"...hello,   world...\"'"), "hello world");
  assertEquals(cleanAnswer('"""...test—case,   here..."""'), "testcase here");
  assertEquals(cleanAnswer("'...Dr. John, M.D...'"), "dr john md");
});

Deno.test("cleanAnswer - handles edge cases", () => {
  assertEquals(cleanAnswer(""), "");
  assertEquals(cleanAnswer("   "), "");
  assertEquals(cleanAnswer("a"), "a");
  assertEquals(cleanAnswer(","), "");
  assertEquals(cleanAnswer("—"), "");
  assertEquals(cleanAnswer("."), "");
});

Deno.test(
  "cleanAnswer - preserves internal punctuation except periods and quotes",
  () => {
    assertEquals(cleanAnswer("Don't do that"), "dont do that");
    assertEquals(cleanAnswer("It's working"), "its working");
    assertEquals(cleanAnswer("What? Really!"), "what? really!");
    assertEquals(cleanAnswer("Mr. Jones"), "mr jones");
    assertEquals(cleanAnswer("U.S.A. is great!"), "usa is great!");
  },
);
