declare interface LLMMessage {
  role: string;
  content: string;
  text?: string;
  [key: string]: any;
}

declare interface LLMData {
  supplier: string;
  options: LLMOption[];
  params: {
    [key: string]: any;
    model: string;
  };
  configId: number;
}

declare interface LLMItem {
  id: number;
  options: LLMOption[];
  title: string;
  type: string;
  select: string[];
}

declare interface LLMOption {
  field: string;
  value?: any;
  type: 'boolean' | 'number' | 'string';
  title: string;
  default?: any;
  max?: number;
  min?: number;
  supports?: string[];
  select?: string[];
  status?: boolean;
  [key: string]: any;
}
