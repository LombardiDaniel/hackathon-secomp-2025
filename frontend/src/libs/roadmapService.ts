export interface CreateRoadmapPayload {
  prompt: string;
  username: string;
}

export interface CreateRoadmapResponse {
  success: boolean;
  roadmapId?: string;
}

export const postRoadmapPrompt = async ({ prompt, username }: CreateRoadmapPayload): Promise<CreateRoadmapResponse> => {
  const trimmedPrompt = prompt.trim();
  const trimmedUsername = username.trim();

  if (!trimmedPrompt || !trimmedUsername) {
    return { success: false };
  }

  const API_BASE = (process.env.NEXT_PUBLIC_ROADY_API_BASE ?? "https://api.roady.patos.dev").replace(/\/$/, "");
  const ROADMAPS_URL = `${API_BASE}/v1/roadmaps` as const;

  const params = new URLSearchParams({
    prompt: trimmedPrompt,
    email: trimmedUsername
  });

  try {
    const response = await fetch(`${ROADMAPS_URL}?${params.toString()}`, {
      method: "POST",
      headers: { Accept: "text/plain, application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("Failed to create roadmap", response.status, response.statusText);
      return { success: false };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    let roadmapId: string | undefined;

    if (isJson) {
      const data = await response.json();
      roadmapId = typeof data === "string"
        ? data
        : typeof data?.roadmapId === "string"
          ? data.roadmapId
          : undefined;
    } else {
      roadmapId = (await response.text()).trim();
    }

    if (!roadmapId) {
      console.error("Roadmap creation succeeded but no id was returned");
      return { success: false };
    }

    return {
      success: true,
      roadmapId
    };
  } catch (error) {
    console.error("Unexpected error while creating roadmap", error);
    return { success: false };
  }
};
