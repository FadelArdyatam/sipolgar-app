/**
 * Calculate Body Mass Index (BMI)
 * BMI = weight(kg) / height(m)²
 *
 * @param weight Weight in kilograms
 * @param height Height in centimeters
 * @returns BMI value
 */
export const calculateBMI = (weight: number, height: number): number => {
  // Convert height from cm to meters
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

/**
 * Get BMI category based on BMI value
 *
 * @param bmi Body Mass Index value
 * @returns BMI category description
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return "Kekurangan berat badan"
  if (bmi < 25) return "Normal"
  if (bmi < 30) return "Kelebihan berat badan"
  return "Obesitas"
}

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 *
 * @param weight Weight in kilograms
 * @param height Height in centimeters
 * @param age Age in years
 * @param gender 'Laki-laki' or 'Perempuan'
 * @returns BMR value in calories per day
 */
export const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
  if (gender === "Laki-laki") {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 *
 * @param bmr Basal Metabolic Rate
 * @param activityLevel Activity level ID ('sedentary', 'light', 'moderate', 'active', 'very_active')
 * @returns TDEE value in calories per day
 */
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Heavy exercise 6-7 days/week
    very_active: 1.9, // Very heavy exercise, physical job or training twice a day
  }

  const multiplier = activityMultipliers[activityLevel] || 1.2
  return bmr * multiplier
}

/**
 * Calculate calorie targets based on fitness goal
 *
 * @param tdee Total Daily Energy Expenditure
 * @param fitnessGoal Fitness goal ('lose_weight', 'gain_muscle', 'maintain', 'improve_fitness')
 * @returns Object with calorie targets
 */
export const calculateCalorieTargets = (
  tdee: number,
  fitnessGoal: string,
): { maintenance: number; target: number; protein: number; carbs: number; fat: number } => {
  let target = tdee

  if (fitnessGoal === "lose_weight") {
    target = tdee - 500 // 500 calorie deficit for weight loss
  } else if (fitnessGoal === "gain_muscle") {
    target = tdee + 300 // 300 calorie surplus for muscle gain
  }

  // Macronutrient calculations (approximate percentages)
  const protein = Math.round((target * 0.3) / 4) // 30% of calories from protein, 4 calories per gram
  const fat = Math.round((target * 0.25) / 9) // 25% of calories from fat, 9 calories per gram
  const carbs = Math.round((target * 0.45) / 4) // 45% of calories from carbs, 4 calories per gram

  return {
    maintenance: Math.round(tdee),
    target: Math.round(target),
    protein,
    carbs,
    fat,
  }
}

/**
 * Calculate age from date of birth
 *
 * @param dateOfBirth Date of birth string in format YYYY-MM-DD
 * @returns Age in years
 */
export const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDifference = today.getMonth() - dob.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  return age
}

