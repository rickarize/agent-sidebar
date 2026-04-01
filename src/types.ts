export type ItemStatus = "pending" | "active" | "done";

export interface ChecklistItem {
  id: string;
  text: string;
  status: ItemStatus;
}

export interface ChecklistState {
  items: ChecklistItem[];
}

export interface ElicitationOption {
  id: string;
  label: string;
  hasTextEntry?: boolean;
}

export interface ElicitationQuestion {
  id: string;
  prompt: string;
  type: "single" | "multi" | "freeform";
  options?: ElicitationOption[];
}

export interface ElicitationAnswers {
  [questionId: string]: string[] | string;
}
