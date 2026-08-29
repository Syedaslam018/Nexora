import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendingUp } from "lucide-react";
import { MetricCard } from "./MetricCard";

describe("MetricCard", () => {
  it("renders the label and value", () => {
    render(<MetricCard label="Total Revenue" value="$12,345.00" icon={TrendingUp} />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("$12,345.00")).toBeInTheDocument();
  });

  it("shows a loading skeleton instead of the value while loading", () => {
    render(<MetricCard label="Total Revenue" value="$12,345.00" icon={TrendingUp} isLoading />);
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.queryByText("$12,345.00")).not.toBeInTheDocument();
  });
});
