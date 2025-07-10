export interface TodoUpdateInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface ListOptions {
  completed?: boolean;
  pending?: boolean;
}

export interface UpdateOptions {
  title?: string;
  description?: string;
}

export interface AddOptions {
  description?: string;
}