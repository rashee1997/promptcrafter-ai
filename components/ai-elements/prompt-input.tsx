"use client";

// PromptInput is split across focused modules to keep every file under the
// ~350-line ceiling; this entry re-exports the full public API.
export * from "./prompt-input-actions";
export * from "./prompt-input-core";
export * from "./prompt-input-menus";
export * from "./prompt-input-parts";
export * from "./prompt-input-provider";
export * from "./prompt-input-textarea";
