import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, Utensils, Heart } from "lucide-react";
import ProfileSettings from "@/components/profile/ProfileSettings";
import RestaurantPreferences from "@/components/profile/RestaurantPreferences";
import SavedRestaurants from "@/components/profile/SavedRestaurants";

const Profile = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="space-x-2">
            <UserCog className="h-4 w-4" />
            <span>Profile Settings</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="space-x-2">
            <Utensils className="h-4 w-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="space-x-2">
            <Heart className="h-4 w-4" />
            <span>Saved Places</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <RestaurantPreferences />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Restaurants</CardTitle>
            </CardHeader>
            <CardContent>
              <SavedRestaurants />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;