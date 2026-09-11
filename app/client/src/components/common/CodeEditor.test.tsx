import React from "react";
import { render, screen } from "@testing-library/react";
import CodeEditor from "./CodeEditor";

describe("read-only CodeEditor", () => {
  it("renders the language chip and line contents", () => {
    render(<CodeEditor language="bash" value={"echo hi\necho bye"} />);
    expect(screen.getByText("bash")).toBeInTheDocument();
    expect(screen.getByText("echo hi")).toBeInTheDocument();
  });

  it("invokes onCopy with the full value", () => {
    const onCopy = jest.fn();
    render(<CodeEditor onCopy={onCopy} value="SELECT 1;" />);
    screen.getByText("Copy").click();
    expect(onCopy).toHaveBeenCalledWith("SELECT 1;");
  });
});
