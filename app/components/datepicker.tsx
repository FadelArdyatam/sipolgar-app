import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { format, addMonths, subMonths, getDaysInMonth, getYear, getMonth } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Input } from './input';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentMonth);
    newDate.setDate(day);
    onChange(newDate);
    setShowDatePicker(false);
  };

  const renderCalendar = () => {
    const year = getYear(currentMonth);
    const month = getMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Create array of days
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        value.getDate() === i && 
        value.getMonth() === month && 
        value.getFullYear() === year;

      days.push(
        <TouchableOpacity
          key={i}
          className={`w-10 h-10 items-center justify-center rounded-full ${isSelected ? "bg-amber-500" : ""}`}
          onPress={() => selectDate(i)}
        >
          <Text className={`${isSelected ? "text-white" : "text-gray-800"}`}>{i}</Text>
        </TouchableOpacity>,
      );
    }

    // Group days into rows (weeks)
    const rows: React.ReactNode[] = [];
    let cells: React.ReactNode[] = [];

    days.forEach((day, i) => {
      if (i % 7 === 0 && cells.length > 0) {
        rows.push(
          <View key={i / 7} className="flex-row justify-around my-1">
            {cells}
          </View>,
        );
        cells = [];
      }
      cells.push(day);
    });

    if (cells.length > 0) {
      rows.push(
        <View key={days.length} className="flex-row justify-around my-1">
          {cells}
        </View>,
      );
    }

    return rows;
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Input
          label={label}
          leftIcon={<Calendar size={20} color="#6b7280" />}
          value={format(value, "dd/MM/yyyy")}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-4 w-80">
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity 
                className="p-2 rounded-full active:bg-gray-100" 
                onPress={goToPreviousMonth}
              >
                <ChevronLeft size={24} color="#4b5563" />
              </TouchableOpacity>
              <Text className="text-lg font-medium text-gray-800">{format(currentMonth, "MMMM yyyy")}</Text>
              <TouchableOpacity 
                className="p-2 rounded-full active:bg-gray-100" 
                onPress={goToNextMonth}
              >
                <ChevronRight size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View className="mb-2">
              <View className="flex-row justify-around">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
                  <Text key={day} className="text-gray-500 w-10 text-center">
                    {day}
                  </Text>
                ))}
              </View>
              {renderCalendar()}
            </View>

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2 mr-2 rounded-lg bg-gray-200 active:bg-gray-300"
                onPress={() => setShowDatePicker(false)}
              >
                <Text className="text-gray-800">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-amber-500 active:bg-amber-600"
                onPress={() => setShowDatePicker(false)}
              >
                <Text className="text-white">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}