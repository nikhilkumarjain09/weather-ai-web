import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import StatCard from "@/components/dashboard/StatCard";
import { Send } from "lucide-react";

test("renders StatCard with correct value and labels", () => {
  render(
    <StatCard
      label="Requests Today"
      icon={Send}
      value={42}
      caption="WeatherAI calls"
    />
  );
  expect(screen.getByText("Requests Today")).toBeInTheDocument();
  expect(screen.getByText("42")).toBeInTheDocument();
  expect(screen.getByText("WeatherAI calls")).toBeInTheDocument();
});
