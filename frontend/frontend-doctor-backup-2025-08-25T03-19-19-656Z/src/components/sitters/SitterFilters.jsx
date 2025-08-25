import { Filter, X as XIcon as XIcon } from 'lucide-react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function SitterFilters({ filters, onFiltersChange }) {
  const updateFilter = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    onFiltersChange({
      maxRate: "",
      rating: "",
      location: "",
      verified: false
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "" && value !== false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 px-6 border-gray-200 hover:bg-[#A2D4F5]/10">
          <Filter className="w-5 h-5 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-[#A2D4F5] rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filter Sitters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <XIcon className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxRate" className="text-sm font-medium mb-2 block">
                  Max Hourly Rate
                </Label>
                <Input
                  id="maxRate"
                  type="number"
                  placeholder="e.g. 30"
                  value={filters.maxRate}
                  onChange={(e) => updateFilter('maxRate', e.target.value)}
                  className="border-gray-200 focus:border-[#A2D4F5]"
                />
              </div>
              
              <div>
                <Label htmlFor="rating" className="text-sm font-medium mb-2 block">
                  Minimum Rating
                </Label>
                <Select value={filters.rating} onValueChange={(value) => updateFilter('rating', value)}>
                  <SelectTrigger className="border-gray-200 focus:border-[#A2D4F5]">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Any rating</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="3.5">3.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location" className="text-sm font-medium mb-2 block">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="City or area"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="border-gray-200 focus:border-[#A2D4F5]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => updateFilter('verified', checked)}
                />
                <Label htmlFor="verified" className="text-sm">
                  Verified sitters only
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}