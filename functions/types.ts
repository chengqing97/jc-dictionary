export type Suggestion = {
  word: string;
  def?: string;
};

export type LookupResult = {
  keyword: string;
  ukPhonetic?: string;
  usPhonetic?: string;
  definition?: string;
  suggestions?: Suggestion[];
  isLocal?: boolean;
};

export type LookupStatus = "init" | "searching" | "success" | "error";
