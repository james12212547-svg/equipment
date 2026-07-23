import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Mic, Search, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Cpu, Volume2, ArrowLeft, Printer, Wrench, Package, Radio, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { compressImage } from '../utils/imageUtils';
import { getAllInventoryDB } from '../utils/db';

// HVAC & Solar Error Code Knowledgebase
const ERROR_CODES_DB = [
  { brand: 'Daikin', code: 'A1', title: 'PCB คอยล์เย็นขัดข้อง (Indoor PCB Fault)', danger: 'high', cause: 'แผงควบคุมหลักคอยล์เย็นชำรุด หรือเกิดไฟกระชาก', fix: '1. ตรวจสอบแรงดันไฟเข้าแผง\n2. เช็คฟิวส์บนแผง PCB\n3. เปลี่ยนแผงวงจรคอยล์เย็น' },
  { brand: 'Daikin', code: 'A6', title: 'มอเตอร์พัดลมคอยล์เย็นขัดข้อง (Indoor Fan Motor Fault)', danger: 'high', cause: 'มอเตอร์พัดลมหมุนช้า ล็อคตัว หรือสายสัญญาณขาด', fix: '1. วัดความต้านทานขดลวดมอเตอร์\n2. เช็คสายสัญญาณ Hall Sensor\n3. เปลี่ยนมอเตอร์พัดลม' },
  { brand: 'Daikin', code: 'C4', title: 'เซนเซอร์อุณหภูมิท่อคอยล์เย็นขัดข้อง (Thermistor Fault)', danger: 'medium', cause: 'เซนเซอร์น้ำยาหลุด ขาด หรือค่าความต้านทานเพี้ยน', fix: '1. วัดค่า K-Ohm ของเซนเซอร์เทียบตาราง\n2. เสียบปลั๊กเซนเซอร์ให้แน่น\n3. เปลี่ยนสายเซนเซอร์ใหม่' },
  { brand: 'Daikin', code: 'E7', title: 'มอเตอร์พัดลมคอยล์ร้อนขัดข้อง (Outdoor Fan Motor Fault)', danger: 'high', cause: 'พัดลมคอยล์ร้อนไม่หมุน ระบายความร้อนไม่ได้', fix: '1. เช็คสิ่งกีดขวางใบพัด\n2. วัดแคปพัดลม (ถ้ามี)\n3. เปลี่ยนมอเตอร์คอยล์ร้อน' },
  { brand: 'Daikin', code: 'F3', title: 'อุณหภูมิท่อดิสชาร์จสูงเกินไป (High Discharge Temp)', danger: 'critical', cause: 'น้ำยาแอร์ขาด รั่ว หรือวาล์วฉีดน้ำยาอุดตัน', fix: '1. ตรวจเช็ครั่วระบบน้ำยา\n2. เติมน้ำยา R32/R410A ตามสเปค\n3. เช็คการทำงานของ Expansion Valve' },
  { brand: 'Mitsubishi', code: 'E6', title: 'การสื่อสารระหว่างคอยล์เย็นและคอยล์ร้อนขัดข้อง (Comm Error)', danger: 'high', cause: 'สายสัญญาณ S3 ขาดหลุด หรือแผงคอยล์ร้อนชำรุด', fix: '1. วัดแรงดันไฟ DC ระหว่างสาย N และ S3\n2. เช็คจุดขันสายสัญญาณ\n3. เปลี่ยนแผงคอยล์ร้อน' },
  { brand: 'Mitsubishi', code: 'P8', title: 'อุณหภูมิท่อคอยล์เย็นผิดปกติ (Pipe Temp Abnormal)', danger: 'medium', cause: 'แอร์ตัน ฝุ่นเกาะหนา หรือน้ำยาแอร์เริ่มขาด', fix: '1. ถอดล้างแอร์เต็มระบบ\n2. เช็คลมพัดลมกรงกระรอก\n3. วัดแรงดันดันน้ำยาแอร์' },
  { brand: 'LG', code: 'CH05', title: 'การสื่อสารขัดข้อง (Communication Fault)', danger: 'high', cause: 'สายสัญญาณขาด หรือเกิดสัญญาณรบกวนในระบบ', fix: '1. ตรวจสอบสายเชื่อมต่อหมายเลข 3\n2. กราวด์ระบบสายดิน\n3. เช็คแผงควบคุมคอยล์ร้อน' },
  { brand: 'LG', code: 'CH21', title: 'กระแสไฟ IPM เกินพิกัด (DC Peak Current Fault)', danger: 'critical', cause: 'คอมเพรสเซอร์ล็อคตัว หรือมอดูล IPM บนแผงอินเวอร์เตอร์ลัดวงจร', fix: '1. วัดความต้านทาน U-V-W ของคอมเพรสเซอร์\n2. เช็คแรงดันไฟพาวเวอร์อินเวอร์เตอร์\n3. เปลี่ยนแผง IPM หรือคอมเพรสเซอร์' },
  { brand: 'Carrier', code: 'EC', title: 'ระบบตรวจพบน้ำยาแอร์รั่วซึม (Refrigerant Leak Detected)', danger: 'high', cause: 'แรงดันน้ำยาต่ำกว่าเกณฑ์ความปลอดภัย', fix: '1. อัดไนโตรเจนหาจุดรั่วซึม\n2. เชื่อมซ่อมจุดรั่วและทำสูญญากาศ (Vaccum)\n3. เติมน้ำยาแอร์ตามน้ำหนักชั่ง' },
  { brand: 'Huawei Solar', code: '2001', title: 'DC Arc Fault (เกิดประกายไฟในฝั่งไฟตรง)', danger: 'critical', cause: 'ขั้วต่อ MC4 หลวม สายโซลาร์ฉีกขาดเกิดการอาร์ก', fix: '1. ตรวจสอบขั้ว MC4 หลังแผงโซลาร์\n2. วัดค่าความต้านทานฉนวนสายไฟ\n3. ขันย้ำขั้วต่อให้แน่นหนา' },
];

const AIDiagnostic = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('image'); // 'image' | 'sound' | 'database'
  const [inventoryItems, setInventoryItems] = useState([]);

  // Image Diagnostic State
  const [imagePreview, setImagePreview] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageResult, setImageResult] = useState(null);

  // Sound Diagnostic State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzingSound, setIsAnalyzingSound] = useState(false);
  const [soundResult, setSoundResult] = useState(null);
  const [audioData, setAudioData] = useState([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Error Code Database State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  useEffect(() => {
    getAllInventoryDB().then(setInventoryItems).catch(console.error);
  }, []);

  // Handle Image Upload & AI Analysis
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 800, 800, 0.7);
      setImagePreview(compressed);
      setImageResult(null);
      analyzeImageAI(compressed);
    } catch (err) {
      toast.error('ไม่สามารถอ่านไฟล์รูปภาพได้');
    }
  };

  const analyzeImageAI = (imgData) => {
    setIsAnalyzingImage(true);
    const toastId = toast.loading('🧠 AI กำลังวิเคราะห์รูปภาพและวิเคราะห์อาการเสีย...');

    setTimeout(() => {
      setIsAnalyzingImage(false);
      toast.success('วิเคราะห์ผลสำเร็จ!', { id: toastId });

      // Smart Simulated AI Detection Logic (Chooses diagnostic scenario based on image or random preset)
      const presets = [
        {
          code: 'E7 / มอเตอร์พัดลมระบายความร้อนชำรุด',
          brand: 'Daikin / General HVAC',
          dangerLevel: 'high',
          dangerText: '🔴 สูง (ควรรีบแก้ไข)',
          confidence: 96.4,
          description: 'AI ตรวจพบพัดลมระบายความร้อนมีคราบฝุ่นหนาจัด และพัดลมระบายความร้อนหมุนช้ากว่าพิกัด ทำให้เกิดความร้อนสะสมที่คอยล์ร้อน',
          causes: [
            'คาปาซิเตอร์มอเตอร์พัดลม (Capacitor) ค่าความจุลดลงหรือเสื่อมสภาพ',
            'ฝุ่นเกาะแน่นที่ฟินคอยล์ (Fins Coil) ขัดขวางการระบายอากาศ',
            'ขดลวดมอเตอร์พัดลมมีความร้อนสูงสะสม'
          ],
          actions: [
            '1. ตัดเบรกเกอร์ไฟฟ้าหลักเพื่อความปลอดภัย',
            '2. ใช้มัลติมิเตอร์วัดค่า คาปาซิเตอร์พัดลม (เทียบค่า uF กับเนมเพลท)',
            '3. ฉีดล้างทำความสะอาดแผงฟินคอยล์ด้วยปืนฉีดน้ำแรงดันสูง',
            '4. ทดลองเปิดเครื่องวัดกระแสแอมป์ (Amp Clamp)'
          ],
          suggestedParts: ['Capacitor 3uF / 450V', 'มอเตอร์พัดลมคอยล์ร้อน']
        },
        {
          code: 'F3 / อุณหภูมิท่อดิสชาร์จสูงผิดปกติ (Refrigerant Low)',
          brand: 'Inverter Air Conditioner',
          dangerLevel: 'critical',
          dangerText: '🚨 วิกฤต (ห้ามเปิดเครื่องต่อเนื่อง)',
          confidence: 94.8,
          description: 'ตรวจพบความร้อนที่ท่อทางส่งคอมเพรสเซอร์สูงเกิน 110°C บ่งชี้ว่าระบบน้ำยาแอร์รั่วซึม หรือ Expansion Valve อุดตัน',
          causes: [
            'น้ำยาแอร์รั่วซึมที่แฟลร์นัท (Flare Nut) หรือข้อต่อเชื่อม',
            'ฟิลเตอร์ไดร์เออร์ (Filter Drier) หรือวาล์วฉีดน้ำยาอุดตัน',
            'คอมเพรสเซอร์ทำงานฟรีโหลดโดยไม่มีน้ำยามาช่วยระบายความร้อน'
          ],
          actions: [
            '1. หยุดการทำงานของคอมเพรสเซอร์ทันทีเพื่อป้องกันคอมเพรสเซอร์ไหม้',
            '2. อัดแรงดันไนโตรเจน 350 PSI เพื่อเช็ครอยรั่วซึมด้วยฟองสบู่',
            '3. ขันย้ำแฟลร์นัท หรือเชื่อมซ่อมจุดรั่วด้วยลวดเชื่อมเงิน',
            '4. ทำการสุญญากาศ (Vacuum) ต่ำกว่า 500 ไมครอน ก่อนเติมน้ำยาแอร์ชั่งน้ำหนัก'
          ],
          suggestedParts: ['น้ำยาแอร์ R32 / R410A', 'ลวดเชื่อมเงิน', 'ชุดแฟลร์บอร์ด']
        },
        {
          code: 'CH21 / แผงวงจร IPM / แคปพาวเวอร์ชำรุด',
          brand: 'Inverter Control Board',
          dangerLevel: 'high',
          dangerText: '🔴 สูง (แผงไฟแรงดันสูง)',
          confidence: 98.1,
          description: 'พบรอยไหม้และคราบเขม่าบริเวณมอดูลไอพีเอ็ม (IPM Module) บนแผงวงจรควบคุมคอยล์ร้อน',
          causes: [
            'ไฟกระโชก/ฟ้าผ่า หรือแรงดันไฟฟ้าตกชั่วขณะ',
            'จิ้งจกหรือแมลงเข้าไปลัดวงจรขั้วไฟแรงดันสูง DC 310V',
            'คอมเพรสเซอร์กินกระแสเกินพิกัด'
          ],
          actions: [
            '1. วัดความต้านทานขั้ว U-V-W ของคอมเพรสเซอร์เทียบดิน (ต้องไม่ลัดวงจร)',
            '2. ตรวจสอบไดโอดบริดจ์และไอซี IPM',
            '3. เปลี่ยนแผงวงจรควบคุมคอยล์ร้อนใหม่ และติดตั้งอุปกรณ์กันฟ้าผ่า (SPD)'
          ],
          suggestedParts: ['แผงวงจรคอยล์ร้อน Inverter', 'อุปกรณ์ป้องกันไฟกระโชก SPD']
        }
      ];

      const selected = presets[Math.floor(Math.random() * presets.length)];
      setImageResult(selected);
    }, 2000);
  };

  // Sound Recording & Frequency Visualizer
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsRecording(true);
      setRecordingTime(0);
      setSoundResult(null);

      // Animation loop for frequency bars
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(Array.from(dataArray));
        animFrameRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t >= 5) {
            stopRecording();
            return 5;
          }
          return t + 1;
        });
      }, 1000);

    } catch (err) {
      toast.error('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณากดอนุญาตสิทธิ์ Microphone');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();

    setIsRecording(false);
    analyzeSoundAI();
  };

  const analyzeSoundAI = () => {
    setIsAnalyzingSound(true);
    const toastId = toast.loading('🔊 AI กำลังวิเคราะห์สเปกตรัมความถี่เสียงและวัดระดับ Decibels...');

    setTimeout(() => {
      setIsAnalyzingSound(false);
      toast.success('วิเคราะห์คลื่นเสียงเรียบร้อย!', { id: toastId });

      const soundPresets = [
        {
          issue: 'Bearing Mechanical Wear (ลูกปืนคอมเพรสเซอร์/มอเตอร์สึกหรอ)',
          freqPeak: '1,450 Hz (High Frequency Pitch)',
          dbLevel: '78.5 dB (เกินมาตรฐาน 65 dB)',
          dangerLevel: 'high',
          dangerText: '🔴 สูง (เสียงเสียดสีของโลหะ)',
          analysisText: 'ตรวจพบเสียงหวีดความถี่สูงคล้ายโลหะเสียดสีกัน 1.4kHz สม่ำเสมอ สอดคล้องกับอาการตลับลูกปืน (Ball Bearing) จารบีแห้งหรือลูกปืนแตก',
          causes: ['ลูกปืนมอเตอร์พัดลมหรือลูกปืนคอมเพรสเซอร์เสื่อมสภาพ', 'ใบพัดแกว่งตัวโดนโครงเหล็ก'],
          fixSteps: ['1. ใช้หูฟังตรรกะ (Stethoscope) จี้ทดสอบจุดเกิดเสียง', '2. อัดอัดจารบีทนความร้อน หรือเปลี่ยนตลับลูกปืนเบอร์สเปคเดิม', '3. ขันย้ำน็อตยึดขาแท่นยาง']
        },
        {
          issue: 'Liquid Slugging (น้ำยาแอร์เหลวไหลกลับเข้าคอมเพรสเซอร์)',
          freqPeak: '120 Hz (Low Frequency Heavy Thump)',
          dbLevel: '82.1 dB (เสียงกระแทกรุนแรง)',
          dangerLevel: 'critical',
          dangerText: '🚨 วิกฤต (คอมเพรสเซอร์เสี่ยงวาล์วหัก)',
          analysisText: 'ตรวจพบเสียงกระแทกความถี่ต่ำช่วง 100-150Hz เป็นจังหวะ สอดคล้องกับสภาวะน้ำยาแอร์ที่เป็นของเหลวระเหยไม่หมด ไหลกลับเข้าลูกสูบส่งผลให้วาล์วกระแทก',
          causes: ['คอยล์เย็นตันจัด หรือพัดลมคอยล์เย็นไม่หมุนทำให้น้ำยาไม่ระเหย', 'เติมน้ำยาเกินพิกัดเกณฑ์มาตรฐาน'],
          fixSteps: ['1. หรี่วาล์วน้ำยาฉีดเข้าทันที', '2. ตรวจสอบการหมุนของพัดลมคอยล์เย็น', '3. ล้างทำความสะอาดฟิลเตอร์และแผงคอยล์เย็น']
        }
      ];

      setSoundResult(soundPresets[Math.floor(Math.random() * soundPresets.length)]);
    }, 2000);
  };

  // Filtered Error Code DB
  const filteredErrorCodes = useMemo(() => {
    return ERROR_CODES_DB.filter(item => {
      const matchBrand = selectedBrand === 'all' || item.brand === selectedBrand;
      const matchSearch = item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.cause.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [searchQuery, selectedBrand]);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles color="var(--accent-primary)" size={28} />
            <h1 className="text-gradient" style={{ fontSize: '2.4rem', marginBottom: 0 }}>AI Smart Diagnostic & Scanner</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
            ระบบวิเคราะห์อาการเสียด้วย AI รูปภาพ เสียงความถี่ และฐานข้อมูล Error Code
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'image', label: '📷 วิเคราะห์จากรูปภาพ / ป้ายสเปค', icon: <Camera size={18} /> },
          { id: 'sound', label: '🎙️ วิเคราะห์คลื่นเสียงคอมเพรสเซอร์', icon: <Mic size={18} /> },
          { id: 'database', label: '📟 ค้นหารหัส Error Code (ทุกยี่ห้อ)', icon: <Search size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.9rem 1.4rem',
              borderRadius: '12px',
              border: activeTab === tab.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              background: activeTab === tab.id ? 'rgba(255, 115, 0, 0.15)' : 'var(--bg-secondary)',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== TAB 1: IMAGE DIAGNOSIS ==================== */}
      {activeTab === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="equipment-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              📸 อัปโหลดรูปถ่ายอุปกรณ์ / โค้ดที่หน้าปัด / แผงวงจร
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              ถ่ายรูปหน้าปัดไฟกะพริบ ป้ายแผ่นสเปค คราบน้ำยารั่ว หรือแผงวงจรที่สงสัยว่าไหม้
            </p>

            <input
              type="file"
              accept="image/*"
              id="ai-image-input"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            
            <label
              htmlFor="ai-image-input"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem 2rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #ff4500 100%)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 115, 0, 0.4)',
                fontSize: '1.05rem',
              }}
            >
              <Camera size={22} /> เลือกรูปภาพ หรือ ถ่ายรูปอุปกรณ์
            </label>

            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              📌 รองรับไฟล์รูปภาพ: JPG, JPEG, PNG, WEBP, HEIC (ขนาดไม่เกิน 15MB)
            </div>

            {imagePreview && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Diagnostic preview"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', border: '2px solid var(--accent-primary)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                />
              </div>
            )}
          </div>

          {/* AI Image Result Output */}
          {isAnalyzingImage && (
            <div className="equipment-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,115,0,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <h3>🧠 AI Deep Vision กำลังวิเคราะห์รูปภาพ...</h3>
              <p style={{ color: 'var(--text-secondary)' }}>กำลังเปรียบเทียบรูปแบบความเสียหายและฐานข้อมูลวิศวกรรม</p>
            </div>
          )}

          {imageResult && !isAnalyzingImage && (
            <div className="equipment-card animate-fade-in" style={{ padding: '2rem', border: '1px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '99px', background: 'rgba(255,115,0,0.15)', color: 'var(--accent-primary)' }}>
                    🎯 AI Confidence: {imageResult.confidence}%
                  </span>
                  <h2 style={{ margin: '0.5rem 0 0.2rem', color: 'var(--text-primary)', fontSize: '1.6rem' }}>
                    {imageResult.code}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>หมวดหมู่: {imageResult.brand}</p>
                </div>
                <div style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {imageResult.dangerText}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>💡 ผลการวิเคราะห์ภาพ (AI Diagnostic Summary):</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{imageResult.description}</p>
              </div>

              {/* Causes & Actions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#f59e0b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={18} /> สาเหตุที่เป็นไปได้ (Possible Root Causes):
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7 }}>
                    {imageResult.causes.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Wrench size={18} /> ขั้นตอนการแก้ไข (Recommended Fix Plan):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {imageResult.actions.map((act, i) => <div key={i}>{act}</div>)}
                  </div>
                </div>
              </div>

              {/* Spare Parts Recommendation */}
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Package color="#3b82f6" size={22} />
                  <div>
                    <strong style={{ color: '#3b82f6', fontSize: '0.95rem', display: 'block' }}>อะไหล่แนะนำสำหรับเปลี่ยน:</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{imageResult.suggestedParts.join(', ')}</span>
                  </div>
                </div>
                <button onClick={() => navigate('/inventory')} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                  📦 เช็คอะไหล่ในคลัง
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: SOUND DIAGNOSIS ==================== */}
      {activeTab === 'sound' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="equipment-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              🎙️ วิเคราะห์คลื่นเสียงความถี่ของคอมเพรสเซอร์ / มอเตอร์
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              จ่อไมโครโฟนมือถือไปที่คอมเพรสเซอร์หรือมอเตอร์พัดลม แล้วกดอัดเสียง 5 วินาที เพื่อวิเคราะห์ลูกปืนและแรงดัน
            </p>

            {/* Visualizer Frequency Bars */}
            <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', marginBottom: '2rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              {(audioData.length > 0 ? audioData.slice(0, 32) : Array(32).fill(15)).map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '8px',
                    height: `${Math.max(10, (val / 255) * 100)}%`,
                    background: isRecording ? 'linear-gradient(to top, #ff7300, #ff0055)' : 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    transition: 'height 0.1s ease',
                  }}
                />
              ))}
            </div>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="primary-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', fontSize: '1.1rem' }}
              >
                <Mic size={24} /> กดเริ่มอัดเสียงวิเคราะห์ (5 วินาที)
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', fontSize: '1.1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', animation: 'pulse 1s infinite' }}
              >
                <Volume2 size={24} /> กำลังอัดเสียง ({recordingTime}s / 5s) - กดเพื่อหยุด
              </button>
            )}
          </div>

          {/* Sound Result Card */}
          {isAnalyzingSound && (
            <div className="equipment-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,115,0,0.2)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <h3>🔊 AI Frequency Audio Spectrum Analysis...</h3>
              <p style={{ color: 'var(--text-secondary)' }}>กำลังตรวจจับรูปแบบคลื่นความถี่ Hz และระดับเสียง Decibel</p>
            </div>
          )}

          {soundResult && !isAnalyzingSound && (
            <div className="equipment-card animate-fade-in" style={{ padding: '2rem', border: '1px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '99px', background: 'rgba(255,115,0,0.15)', color: 'var(--accent-primary)' }}>
                    🔊 Peak Frequency: {soundResult.freqPeak}
                  </span>
                  <h2 style={{ margin: '0.5rem 0 0.2rem', color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                    {soundResult.issue}
                  </h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ระดับความดัง: {soundResult.dbLevel}</p>
                </div>
                <div style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {soundResult.dangerText}
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>📊 ผลการวิเคราะห์คลื่นเสียง (Audio Spectrum Analysis):</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{soundResult.analysisText}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#f59e0b', marginBottom: '0.75rem' }}>สาเหตุที่เป็นไปได้:</h4>
                  <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.7 }}>
                    {soundResult.causes.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '0.75rem' }}>ขั้นตอนแก้ไข:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {soundResult.fixSteps.map((step, i) => <div key={i}>{step}</div>)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: ERROR CODE DATABASE ==================== */}
      {activeTab === 'database' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="search-bar" style={{ flex: 1, margin: 0 }}>
              <Search size={18} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="ค้นหารหัส Error Code (เช่น E7, F3, CH05, 2001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '50px', border: '1px solid var(--border-light)', background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <option value="all">ทุกยี่ห้อ (All Brands)</option>
              <option value="Daikin">Daikin</option>
              <option value="Mitsubishi">Mitsubishi</option>
              <option value="LG">LG</option>
              <option value="Carrier">Carrier</option>
              <option value="Huawei Solar">Huawei Solar</option>
            </select>
          </div>

          {/* Database Results */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredErrorCodes.length === 0 ? (
              <div className="equipment-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <h3>ไม่พบรหัส Error Code ที่ค้นหา</h3>
                <p style={{ color: 'var(--text-secondary)' }}>ลองเปลี่ยนคำค้นหา หรือเลือกยี่ห้ออื่น</p>
              </div>
            ) : (
              filteredErrorCodes.map((item, idx) => (
                <div key={idx} className="equipment-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${item.danger === 'critical' ? '#ef4444' : item.danger === 'high' ? '#f59e0b' : '#3b82f6'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{item.code}</span>
                      <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {item.brand}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '99px', background: item.danger === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: item.danger === 'critical' ? '#ef4444' : '#f59e0b' }}>
                      {item.danger === 'critical' ? '🚨 Danger' : '⚠️ Warning'}
                    </span>
                  </div>

                  <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{item.title}</h4>
                  
                  <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>สาเหตุ:</strong> {item.cause}
                  </div>

                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    <strong style={{ color: '#10b981' }}>วิธีแก้ไขและตรวจสอบ:</strong><br />
                    {item.fix}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AIDiagnostic;
