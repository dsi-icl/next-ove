export const loadSigningKey = async (serverUrl: string | undefined) => {
  if (serverUrl === undefined) return null;
  try {
    return await (
      await fetch(serverUrl, {
        credentials: "include",
      })
    ).text();
  } catch (e) {
    console.error(e);
    return null;
  }
};