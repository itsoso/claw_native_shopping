import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

import { DecisionCard } from "../ui/DecisionCard.js";
import type { ProductDecisionProps } from "../types/recommendation.js";

export function mountReactNode(container: HTMLElement, node: ReactNode): Root {
  const root = createRoot(container);
  root.render(node);
  return root;
}

export function mountDecisionCard(
  container: HTMLElement,
  props: ProductDecisionProps,
): Root {
  return mountReactNode(container, <DecisionCard {...props} />);
}
