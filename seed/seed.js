import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Station from '../models/Station.js';
import Visit from '../models/Visit.js';
import Inspector from '../models/Inspector.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const USERS = [
  {
    name: 'Admin User',
    email: 'admin@fims.com',
    password: 'password123',
    role: 'admin',
  },
];

const stationNames = [
  "ساسكو - SASCO", "محطة الماسة نجد (مزايا نفط)", "محطة الدريس 1086", "بترومين - Petromin",
  "مؤسسة افاق الوسيلة للتجارة", "تروجينا - Trojena", "محطة ركن المصيف (اكاسيا)",
  "شركة خدمات النفط (نفط المصيف)", "شركة كوست للوقود", "الماسية جاز للوقود",
  "الدريس للخدمات البترولية", "محطة عبدالله الزهراني", "محطة بساتين تبوك للوقود",
  "محطة بترولي", "محطة الفهد", "محطة الراجحي", "محطة النجم الذهبي", "محطة الرياض",
  "محطة الجزيرة", "محطة الخليج", "محطة الوطن", "محطة الأمل", "محطة النور",
  "محطة الفجر", "محطة الشمس", "محطة القمر", "محطة النجوم", "محطة السلام",
  "محطة الوفاء", "محطة العزم", "محطة التقدم", "محطة الإنجاز", "محطة الريادة",
  "محطة المستقبل", "محطة التميز"
];

const STATIONS = stationNames.map((name, i) => {
  const safety = [59, 88, 50, 48, 91, 35, 83, 88, 62, 97, 36, 67, 45, 46, 78, 82, 65, 55, 90, 73, 68, 42, 86, 71, 58, 93, 49, 77, 84, 61, 70, 56, 80, 64, 75][i] ?? 60;
  return {
    code: `TBGS${String(58 + i * 7).padStart(5, "0")}`,
    name, 
    region: "تبوك", 
    activity: "محطة وقود",
    branch: "فرع تبوك - المنطقة الشمالية",
    safetyScore: safety, 
    visitCount: ((i * 3) % 5) + 1,
  };
});

const INSPECTORS = [
  { name: "يوسف ناصر", role: "inspector" },
  { name: "أحمد الراشد", role: "inspector" },
  { name: "خالد منصور", role: "admin" },
  { name: "فيصل العتيبي", role: "inspector" },
  { name: "عمر حسين", role: "inspector" },
  { name: "mohamed khaled hassan", role: "admin" }
];

const SETTINGS = [
  {
    key: "severityWeights",
    value: {
      "حادث": 25,
      "حادث وشيك": 15,
      "مخالفة": 10,
      "الحالة غير الآمنة": 8,
      "الإصابة": 20,
      "تصرف غير آمن": 6
    }
  },
  {
    key: "visitTypes",
    value: [
      "السلامة", "الجودة الشاملة", "متابعة دورية", "مخالفات", 
      "ترخيص", "تخصيص", "متابعة امتثال", "مسح ميداني", "مباشرة بلاغ"
    ]
  }
];

const importData = async () => {
  try {
    await connectDB();

    await Station.deleteMany();
    await Visit.deleteMany();
    await Inspector.deleteMany();
    await Settings.deleteMany();
    await User.deleteMany();

    const createdStations = await Station.insertMany(STATIONS);
    await Inspector.insertMany(INSPECTORS);
    await Settings.insertMany(SETTINGS);
    await User.create(USERS);

    // Create some visits
    const VISIT_TYPES = ["السلامة", "الجودة الشاملة", "متابعة دورية", "مخالفات"];
    const SEVERITIES = ["حادث", "مخالفة", "الحالة غير الآمنة", "تصرف غير آمن"];
    
    const visits = [];
    
    for(let i=0; i<14; i++) {
      const station = createdStations[i % 6];
      const safety = [62,89,68,84,67,97,62,71,100,64,62,72,86,91][i];
      const severity = SEVERITIES[i % SEVERITIES.length];
      
      const numViolations = [1,2,4,5,5,0,5,4,0,3,1,1,4,0][i];
      const notes = [];
      
      if (numViolations > 0) {
        notes.push({
          element: "مضخة الوقود",
          description: "Pump nozzle shows signs of wear and minor leakage detected",
          severity: severity,
          correctiveAction: "Replace nozzle assembly and conduct pressure test",
          recurring: i % 3 === 0,
        });
      }

      visits.push({
        station: station._id,
        stationName: station.name,
        stationCode: station.code,
        region: station.region,
        type: VISIT_TYPES[i % VISIT_TYPES.length],
        date: new Date(new Date().setDate(new Date().getDate() - i*2)), // some days ago
        inspectors: [INSPECTORS[i % INSPECTORS.length].name],
        refNumber: `REF-2026-00${10 + i}`,
        notes: notes,
        safetyScore: safety
      });
    }

    await Visit.insertMany(visits);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroyData(); // Not implemented for brevity
} else {
  importData();
}
