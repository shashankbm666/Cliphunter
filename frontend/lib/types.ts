export type Clip = {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  timestamp: string;
  seconds: number;
  description: string;
  tags: string[];
  confidence: number;
  sourceLabel: string;
  sourceUrl: string | null;
};

export type IngestResponse = {
  videoId: string;
  title: string;
  status: string;
  clips: Clip[];
};
