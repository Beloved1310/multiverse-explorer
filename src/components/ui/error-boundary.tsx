"use client";

import { Component, type ReactNode } from "react";
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * A safety net for unexpected rendering bugs -- distinct from the
 * explicit loading/error/empty states, which handle expected API
 * failures without ever throwing. Must be a class component: React has
 * no hook-based equivalent to getDerivedStateFromError/componentDidCatch.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-4 py-12 text-center"
        >
          <p className="text-body text-foreground">
            Something unexpected went wrong.
          </p>
          <Button onClick={this.handleReset}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
