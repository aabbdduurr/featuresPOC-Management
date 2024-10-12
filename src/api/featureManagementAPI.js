import { apiBaseUrl, staticBaseUrl, authToken } from "../config";

class FeatureManagementAPI {
  constructor() {
    this.apiBaseUrl = apiBaseUrl;
    this.staticBaseUrl = staticBaseUrl;
    this.authToken = authToken;
  }

  // Fetch the list of platforms from static files
  async getPlatforms() {
    try {
      const response = await fetch(`${this.staticBaseUrl}/platforms.json`);
      if (!response.ok) throw new Error("Error fetching platforms");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Fetch platform-specific data from static files
  async getPlatformData(platform) {
    try {
      const response = await fetch(
        `${this.staticBaseUrl}/platforms/${platform}.json`
      );
      if (!response.ok)
        throw new Error(`Error fetching data for platform: ${platform}`);
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getSegmentData() {
    try {
      const response = await fetch(`${this.staticBaseUrl}/segments.json`);
      if (!response.ok) throw new Error("Error fetching segments");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Create a new group in the selected platform
  async createGroup(platform, groupData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authToken,
        },
        body: JSON.stringify({
          action: "create-group",
          platform,
          featureGroup: groupData,
        }),
      });
      if (!response.ok) throw new Error("Error creating group");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Delete a group from a platform
  async deleteGroup(platform, groupId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authToken,
        },
        body: JSON.stringify({
          action: "delete-group",
          platform,
          featureGroup: { id: groupId },
        }),
      });
      if (!response.ok) throw new Error("Error deleting group");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Create a new feature in a group
  async createFeature(platform, groupId, featureData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authToken,
        },
        body: JSON.stringify({
          action: "create-feature",
          platform,
          feature: {
            ...featureData,
            groupId, // Make sure to include the groupId in the payload
          },
        }),
      });
      if (!response.ok) throw new Error("Error creating feature");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Delete a feature from a group
  async deleteFeature(platform, groupId, featureId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authToken,
        },
        body: JSON.stringify({
          action: "delete-feature",
          platform,
          feature: { id: featureId },
        }),
      });
      if (!response.ok) throw new Error("Error deleting feature");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Update a feature's value or rollout settings with the required segmentCombination
  async updateFeatureValue(
    platform,
    featureId,
    featureValue,
    segmentCombination = {},
    rollout = null
  ) {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authToken,
        },
        body: JSON.stringify({
          action: "change-feature-value",
          platform, // Ensure platform is included in the payload
          feature: { id: featureId },
          featureValue,
          rollout,
          segmentCombination,
        }),
      });
      if (!response.ok) throw new Error("Error updating feature value");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async deleteSegmentForFeature(platform, featureId, segmentCombination) {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authToken,
        },
        body: JSON.stringify({
          action: "delete-segment-for-feature",
          platform,
          feature: { id: featureId },
          segmentCombination,
        }),
      });
      if (!response.ok) throw new Error("Error deleting feature segments");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  // Reorder feature segments
  async reorderFeatureSegments(platform, featureId, newOrder) {
    try {
      const response = await fetch(`${this.apiBaseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authToken,
        },
        body: JSON.stringify({
          action: "reorder-feature-segments",
          platform,
          feature: { id: featureId },
          newSegmentOrder: newOrder,
        }),
      });
      if (!response.ok) throw new Error("Error reordering feature segments");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }
}

const featureManagementAPI = new FeatureManagementAPI();
export default featureManagementAPI;
