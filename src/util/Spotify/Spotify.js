// test.js code
let accessToken = "";
const clientID = "3b8eff42b7ce40a8be44ba3240b9211f";
const redirectUrl = "https://tollpatsch283.github.io/Jammming/";

function generateRandomString(length = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const base64 = btoa(String.fromCharCode(...hashArray));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const Spotify = {
  async getAccessToken() {
    // Check if the access token is already set.
    if (accessToken) return accessToken;

    // Use URLSearchParams to check if the browser URL contains a valid authorization code. Also check for any error response.
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    // If error is found in the URL (e.g., user denied access), log it and return.
    if (error) {
      console.error("Error during authentication:", error);
      return;
    }

    // If code is present in the URL, retrieve the stored code_verifier from localStorage. Then make a POST request to Spotify’s /api/token endpoint to exchange the code and verifier for an access token.
    if (code) {
      const retreivedCodeVerifier = localStorage.getItem("code_verifier");
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: redirectUrl,
          client_id: clientID,
          code_verifier: retreivedCodeVerifier,
        })
      });

    async savePlaylist(name, trackUris) {
        if (!name || !trackUris) return;
        const aToken = await Spotify.getAccessToken();
        console.log(aToken)
        const header = {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "application/json"
        };
        let userId;
        return fetch(`https://api.spotify.com/v1/me`, { headers: header })
            .then((response) => response.json())
            .then((jsonResponse) => {
                userId = jsonResponse.id;
                let playlistId;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                    headers: header,
                    method: "POST",
                    body: JSON.stringify({ name: name }),
                })
                    .then((response) => response.json())
                    .then((jsonResponse) => {
                        playlistId = jsonResponse.id;
                        return fetch(
                            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                            {
                                headers: header,
                                method: "POST",
                                body: JSON.stringify({ uris: trackUris }),
                            }
                        );
                    });
            });
    },
};

export { Spotify };