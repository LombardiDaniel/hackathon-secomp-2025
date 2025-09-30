const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface CreateRoadmapPayload {
  prompt: string;
  username: string;
}

export interface CreateRoadmapResponse {
  success: boolean;
  roadmapId?: string;
}

export const postRoadmapPrompt = async ({ prompt, username }: CreateRoadmapPayload): Promise<CreateRoadmapResponse> => {
  if (!prompt.trim()) {
    return { success: false };
  }

  // When the backend is ready, swap this mock with a real POST request:
  // const response = await fetch("/api/roadmaps", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ prompt, username })
  // });
  // return response.json();

  await delay(600);

  return {
    success: true,
    roadmapId: `draft-${Date.now().toString(36)}`
  };
};
