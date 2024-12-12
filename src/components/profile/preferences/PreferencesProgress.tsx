import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

interface PreferencesProgressProps {
  completionPercentage: number;
}

const PreferencesProgress = ({ completionPercentage }: PreferencesProgressProps) => {
  return (
    <motion.div 
      className="space-y-4 bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-primary">Profile Completion</h2>
        <span className="text-lg font-semibold text-primary">
          {completionPercentage}%
        </span>
      </div>
      
      <Progress 
        value={completionPercentage} 
        className="h-3 transition-all duration-700 ease-in-out" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {completionPercentage >= 20 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Dietary Preferences</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {completionPercentage >= 40 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Cuisine Preferences</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {completionPercentage >= 60 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Foods to Avoid</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {completionPercentage >= 80 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Atmosphere Preferences</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {completionPercentage >= 100 ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-sm">Protein Preferences</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PreferencesProgress;