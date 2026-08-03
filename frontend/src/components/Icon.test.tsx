import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders SVG for known icon name", () => {
    const { container } = render(<Icon name="logo" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "20");
  });

  it("renders with custom size", () => {
    const { container } = render(<Icon name="dashboard" size={32} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "32");
  });

  it("returns null for unknown icon", () => {
    const { container } = render(<Icon name="nonexistent" />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
