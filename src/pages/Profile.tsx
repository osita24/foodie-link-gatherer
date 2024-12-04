import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import SavedRestaurants from "@/components/profile/SavedRestaurants";

const Profile = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Saved Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <SavedRestaurants />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Restaurant Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <RestaurantPreferences />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;