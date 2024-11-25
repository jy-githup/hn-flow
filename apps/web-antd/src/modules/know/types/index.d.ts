declare interface KnowType {
  id: number;
  name: string;
  icon: string;
  description: string;
  embedConfigId: number;
  embedOptions: any;
  enableRerank?: boolean;
  rerankConfigId?: number;
  rerankOptions?: any;
  updateFrequency: any;
  enable: number;
  [key: string]: any;
}

declare interface KnowConfig {
  id: number;
  func: string;
  description: string;
  type: string;
  options: {
    [key: string]: any;
    comm?: any;
    options?: {
      default: string;
      field: string;
      select?: string[];
      title: string;
    }[];
  };
  [key: string]: any;
}
