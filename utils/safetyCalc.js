export const computeSafetyScore = (notes) => {
  if (!notes || notes.length === 0) return 100;
  
  const weights = {
    'حادث': 25,
    'حادث وشيك': 15,
    'مخالفة': 10,
    'الحالة غير الآمنة': 8,
    'الإصابة': 20,
    'تصرف غير آمن': 6,
  };
  
  let deduction = 0;
  notes.forEach((n) => {
    let w = weights[n.severity] ?? 5; // default penalty if not found
    if (n.urgent) w *= 1.3;
    if (n.recurring) w *= 1.2;
    deduction += w;
  });
  
  return Math.max(10, Math.min(100, Math.round(100 - deduction)));
};
