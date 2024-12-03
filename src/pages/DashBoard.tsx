import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Bell, TrendingUp, ShoppingCart } from 'lucide-react';
import FeaturedInfo from "../components/FeaturedInfo";
import SalesPage from "../components/SalesManagement";


const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:col-span-2 lg:col-span-3">
          <Card className="bg-blue-50">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold">$45,231</h3>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <h3 className="text-2xl font-bold">1,234</h3>
              </div>
              <ShoppingCart className="text-green-500" size={32} />
            </CardContent>
          </Card>
        </div>

        {/* Featured Information */}
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Featured Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedInfo />
            </CardContent>
          </Card>
        </div>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2" size={20} /> 
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>New customer signup</span>
                <span className="text-sm text-gray-500">2 mins ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Monthly report ready</span>
                <span className="text-sm text-gray-500">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Management */}
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Management</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesPage />
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
             
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;