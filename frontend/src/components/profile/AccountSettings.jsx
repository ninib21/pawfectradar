import { Card as CardIcon, CardContent as CardContentIcon, CardHeader as CardHeaderIcon, CardTitle as CardTitleIcon, Shield as ShieldIcon, User as UserIcon } from '@/lib/icons.js';

export default function AccountSettings({ user, onSave, saving }) {
  const handleLogout = async () => {
    try {
      // Assuming a global User object with a logout method, or an equivalent API call
      // This might need adjustment based on actual authentication implementation
      if (typeof User !== 'undefined' && User.logout) {
        await User.logout();
      } else {
        console.warn("User.logout method not found. Implement actual logout logic.");
        // Placeholder for actual logout logic, e.g., redirect or API call
        // window.location.href = '/logout'; 
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <CardIcon className="shadow-lg border-0">
        <CardHeaderIcon>
          <CardTitleIcon className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            Account Information
          </CardTitleIcon>
        </CardHeaderIcon>
        <CardContentIcon className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Account Type</p>
              <Badge className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] text-white border-0">
                {user?.user_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="font-semibold">
                {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'Recently'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Account Status</p>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="font-semibold">{user?.total_bookings || 0}</p>
            </div>
          </div>
        </CardContentIcon>
      </CardIcon>

      {/* Security */}
      <CardIcon className="shadow-lg border-0">
        <CardHeaderIcon>
          <CardTitleIcon className="flex items-center gap-2">
            <ShieldIcon className="w-5 h-5" />
            Security & Privacy
          </CardTitleIcon>
        </CardHeaderIcon>
        <CardContentIcon className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline">
              Enable
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Privacy Settings</h3>
              <p className="text-sm text-gray-600">Control who can see your profile information</p>
            </div>
            <Button variant="outline">
              Manage
            </Button>
          </div>
        </CardContentIcon>
      </CardIcon>

      {/* Payment (if sitter) */}
      {(user?.user_type === 'sitter' || user?.user_type === 'both') && (
        <CardIcon className="shadow-lg border-0">
          <CardHeaderIcon>
            <CardTitleIcon className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Settings
            </CardTitleIcon>
          </CardHeaderIcon>
          <CardContentIcon className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Payout Method</h3>
                <p className="text-sm text-gray-600">Bank account for receiving payments</p>
              </div>
              <Button variant="outline">
                Setup
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Tax Information</h3>
                <p className="text-sm text-gray-600">Manage your tax documents and settings</p>
              </div>
              <Button variant="outline">
                Manage
              </Button>
            </div>
          </CardContentIcon>
        </CardIcon>
      )}

      {/* Danger Zone */}
      <CardIcon className="shadow-lg border-0 border-red-100">
        <CardHeaderIcon>
          <CardTitleIcon className="text-red-700">Account Actions</CardTitleIcon>
        </CardHeaderIcon>
        <CardContentIcon className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-semibold text-red-700">Sign Out</h3>
              <p className="text-sm text-red-600">Sign out of your PawfectRadar account</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="border-red-200 text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContentIcon>
      </CardIcon>
    </div>
  );
}
