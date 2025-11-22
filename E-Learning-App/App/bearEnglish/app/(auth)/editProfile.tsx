import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../api";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Default avatar URL
  const defaultAvatarUrl =
    "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474190UWU/anh-avatar-one-piece-sieu-dep_082621920.jpg";

  useEffect(() => {
    // Request permission for media library
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Sorry, we need camera roll permissions to upload avatar!"
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        const imageUri = result.assets[0].uri;

        try {
          const uploadResponse = await API.uploadAvatar(imageUri);
          if (uploadResponse.success) {
            const avatarUrl = `${API.BASE_URL}${uploadResponse.data.url}`;
            setAvatar(avatarUrl);

            // Update user context immediately with new avatar
            if (user) {
              const updatedUser = { ...user, avatar: avatarUrl };
              console.log("Updating user context with new avatar:", avatarUrl);
              await updateUser(updatedUser);
              console.log("User context updated successfully");
            }

            Alert.alert("Success", "Avatar uploaded successfully!");
          } else {
            Alert.alert(
              "Error",
              uploadResponse.message || "Failed to upload avatar"
            );
          }
        } catch (error: any) {
          console.error("Upload error:", error);
          const errorMessage =
            error.message || "Failed to upload avatar. Please try again.";

          // Show error with option to use local image temporarily
          Alert.alert(
            "Upload Failed",
            `${errorMessage}\n\nWould you like to use this image temporarily? (Note: You'll need to start the DataServer to upload permanently)`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Use Temporarily",
                onPress: () => {
                  setAvatar(imageUri); // Use local URI temporarily
                  Alert.alert(
                    "Info",
                    "Using image temporarily. Start DataServer and try uploading again for permanent storage."
                  );
                },
              },
            ]
          );
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    setLoading(true);
    try {
      const response = await API.updateProfile(fullName, phoneNumber, avatar);

      if (response.success) {
        // Update user context with new data
        await updateUser(response.data);

        Alert.alert("Success", "Profile updated successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#0f0f23", "#16213e", "#1a1a2e"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: avatar || defaultAvatarUrl }}
                style={styles.avatar}
              />
              {uploadingAvatar && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#00d4ff" size="large" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.changeAvatarButton}
              onPress={pickImage}
              disabled={uploadingAvatar}
            >
              <LinearGradient
                colors={["#00d4ff", "#0099ff"]}
                style={styles.changeAvatarGradient}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.changeAvatarText}>
                  {uploadingAvatar ? "Uploading..." : "Change Avatar"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>🐻‍❄️ Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#a4b0be"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📧 Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email || ""}
                editable={false}
                placeholder="Email address"
                placeholderTextColor="#a4b0be"
              />
              <Text style={styles.disabledNote}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>📱 Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor="#a4b0be"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ["#666", "#444"] : ["#00d4ff", "#0099ff"]}
              style={styles.saveGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#00d4ff",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  changeAvatarButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  changeAvatarGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  changeAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f2f6",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2c2c54",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#f1f2f6",
    borderWidth: 1,
    borderColor: "#40407a",
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: "#1a1a2e",
  },
  disabledNote: {
    fontSize: 12,
    color: "#a4b0be",
    marginTop: 4,
    fontStyle: "italic",
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
