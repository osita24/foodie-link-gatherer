import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import SavedRestaurants from "@/components/profile/SavedRestaurants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="saved">Saved Restaurants</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            <ProfileSettings />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Restaurant Preferences</h2>
            <RestaurantPreferences />
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Saved Restaurants</h2>
            <SavedRestaurants />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;