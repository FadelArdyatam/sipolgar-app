import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { cn } from '~/lib/utils';
import type { LucideIcon } from 'lucide-react-native';

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  error?: string;
  onRightIconPress?: () => void;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, leftIcon, rightIcon, label, error, onRightIconPress, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-gray-700 font-medium mb-1">{label}</Text>
        )}
        <View className="relative">
          {leftIcon && (
            <View className="absolute left-3 top-3 z-10">
              {leftIcon}
            </View>
          )}
          <TextInput
            ref={ref}
            className={cn(
              "bg-white border border-gray-200 rounded-lg py-3 text-gray-700",
              leftIcon ? "px-10" : "px-4",
              rightIcon ? "pr-10" : "",
              error ? "border-red-500" : "",
              className
            )}
            placeholderTextColor="#9ca3af"
            {...props}
          />
          {rightIcon && (
            <TouchableOpacity 
              className="absolute right-3 top-3 z-10" 
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text className="text-red-500 text-sm mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };