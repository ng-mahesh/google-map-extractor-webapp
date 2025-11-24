import { render, screen } from "@testing-library/react";
import QuotaDisplay from "./QuotaDisplay";

describe("QuotaDisplay", () => {
  const mockQuota = {
    dailyQuota: 100,
    usedToday: 30,
    remaining: 70,
    resetDate: "2024-01-01T00:00:00.000Z",
  };

  it("should render quota information correctly", () => {
    render(<QuotaDisplay quota={mockQuota} />);

    expect(screen.getByText("70")).toBeInTheDocument();
    expect(screen.getByText("/ 100 today")).toBeInTheDocument();
  });

  it("should display correct percentage in progress bar", () => {
    const { container } = render(<QuotaDisplay quota={mockQuota} />);

    const progressBar = container.querySelector(".bg-google-blue");
    expect(progressBar).toHaveStyle({ width: "30%" });
  });

  it("should show low quota warning when quota is low", () => {
    const lowQuota = {
      ...mockQuota,
      usedToday: 95,
      remaining: 5,
    };

    render(<QuotaDisplay quota={lowQuota} />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("/ 100 today")).toBeInTheDocument();
  });

  it("should show full quota when no usage", () => {
    const fullQuota = {
      ...mockQuota,
      usedToday: 0,
      remaining: 100,
    };

    const { container } = render(<QuotaDisplay quota={fullQuota} />);

    const progressBar = container.querySelector(".bg-google-blue");
    expect(progressBar).toHaveStyle({ width: "0%" });
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("/ 100 today")).toBeInTheDocument();
  });

  it("should show no quota remaining when quota exhausted", () => {
    const exhaustedQuota = {
      ...mockQuota,
      usedToday: 100,
      remaining: 0,
    };

    const { container } = render(<QuotaDisplay quota={exhaustedQuota} />);

    const progressBar = container.querySelector(".bg-google-red");
    expect(progressBar).toHaveStyle({ width: "100%" });
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("/ 100 today")).toBeInTheDocument();
  });
});
