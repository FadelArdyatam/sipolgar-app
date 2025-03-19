import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import type { SatuanKerjaParent, SatuanKerjaChild } from '../../app/types/user';

interface SatuanKerjaPickerProps {
  label?: string;
  selectedName: string;
  parentSatuanKerja: SatuanKerjaParent[];
  childSatuanKerja: SatuanKerjaChild[];
  selectedParentId: number | null;
  selectedChildId: number | null;
  onSelectParent: (id: number) => void;
  onSelectChild: (id: number) => void;
  isLoading: boolean;
}

export function SatuanKerjaPicker({
  label,
  selectedName,
  parentSatuanKerja,
  childSatuanKerja,
  selectedParentId,
  selectedChildId,
  onSelectParent,
  onSelectChild,
  isLoading,
}: SatuanKerjaPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 font-medium mb-1">{label}</Text>}
      <TouchableOpacity
        className="bg-white border border-gray-200 rounded-lg px-4 py-3.5 flex-row justify-between items-center"
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text className={selectedName ? "text-gray-700" : "text-gray-400"}>
          {selectedName || "Pilih Satuan Kerja"}
        </Text>
        <ChevronDown size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-4 h-2/3">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Pilih Satuan Kerja</Text>
              <TouchableOpacity 
                onPress={() => setShowPicker(false)} 
                className="rounded-full py-1 px-3 bg-gray-100 active:bg-gray-200"
              >
                <Text className="text-amber-500 font-medium">Tutup</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="items-center justify-center p-4">
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text className="mt-4 text-gray-500">Memuat data satuan kerja...</Text>
              </View>
            ) : (
              <ScrollView className="mb-4">
                <Text className="text-gray-500 font-medium mb-2">Induk Satuan Kerja</Text>
                {parentSatuanKerja.length > 0 ? (
                  parentSatuanKerja.map((parent) => (
                    <TouchableOpacity
                      key={parent.id}
                      className={`p-3 border-b border-gray-100 rounded-md mb-1 ${
                        selectedParentId === parent.id ? "bg-amber-50 border-l-4 border-l-amber-500" : ""
                      }`}
                      onPress={() => onSelectParent(parent.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`${
                          selectedParentId === parent.id ? "text-amber-500 font-medium" : "text-gray-700"
                        }`}
                      >
                        {parent.nama_satuan_kerja}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-gray-500 italic p-2">Tidak ada data induk satuan kerja</Text>
                )}

                {selectedParentId && (
                  <>
                    <Text className="text-gray-500 font-medium mt-4 mb-2">Anak Satuan Kerja</Text>
                    {childSatuanKerja.length > 0 ? (
                      childSatuanKerja.map((child) => (
                        <TouchableOpacity
                          key={child.id}
                          className={`p-3 border-b border-gray-100 rounded-md mb-1 ${
                            selectedChildId === child.id ? "bg-amber-50 border-l-4 border-l-amber-500" : ""
                          }`}
                          onPress={() => onSelectChild(child.id)}
                          activeOpacity={0.7}
                        >
                          <Text
                            className={`${
                              selectedChildId === child.id ? "text-amber-500 font-medium" : "text-gray-700"
                            }`}
                          >
                            {child.nama_satuan_kerja}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text className="text-gray-500 italic p-2">Tidak ada data anak satuan kerja</Text>
                    )}
                  </>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              className="bg-amber-500 py-3.5 rounded-lg items-center active:bg-amber-600"
              onPress={() => setShowPicker(false)}
            >
              <Text className="text-white font-semibold">Pilih</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}