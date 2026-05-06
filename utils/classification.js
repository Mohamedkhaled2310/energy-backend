export const classify = (score) => {
  if (score >= 90) return 'ممتاز';
  if (score >= 80) return 'جيد جداً';
  if (score >= 70) return 'جيد';
  if (score >= 50) return 'يحتاج تحسين';
  return 'ضعيف';
};
