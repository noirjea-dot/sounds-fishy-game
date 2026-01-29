"use client"
import { useState, useEffect, useCallback, useRef } from 'react'
import Pusher from 'pusher-js'
import { nanoid } from 'nanoid'

const QUESTIONS_POOL = [
{ q: "ประเทศใดที่มีจำนวนเขตเวลา (Time Zones) มากที่สุดในโลก?", a: "ฝรั่งเศส (12 เขตเวลา)" },
  { q: "หากนำดาวเสาร์ไปวางในน้ำจะเกิดอะไรขึ้น? ", a: "ดาวเสาร์จะลอยน้ำ" },
  { q: "สัตว์ชนิดใดที่เป็นสาเหตุให้มนุษย์เสียชีวิตมากที่สุดในโลกต่อปี? ", a: "ยุง" },
  { q: "บนดาวศุกร์ (Venus) หนึ่งวันกับหนึ่งปี อะไรยาวกว่ากัน? ", a: "หนึ่งวันยาวกว่าหนึ่งปี" },
  { q: "สัตว์ชนิดใดที่ไม่มีวันตายตามธรรมชาติ (Biological Immortality)? ", a: "แมงกะพรุน Turritopsis dohrnii" },
  { q: "กล้วยหอมในทางพฤกษศาสตร์ จัดว่าเป็นผลไม้ประเภทใด? 🍌", a: "เบอร์รี่ (Berry)" },
  { q: "สตรอว์เบอร์รี่ในทางพฤกษศาสตร์ 'ไม่ใช่' เบอร์รี่ แต่จัดเป็นอะไร? 🍓", a: "ผลกลุ่ม (Aggregate fruit)" },
  { q: "น้ำตกลูกบาศก์ที่ใหญ่ที่สุดในโลกไม่ได้อยู่บนดิน แต่อยู่ที่ไหน? ", a: "ใต้ทะเล (เดนมาร์กสเตรต)" },
  { q: "อวัยวะใดในร่างกายมนุษย์ที่สามารถงอกใหม่ได้เองแม้เหลือเพียง 25%? 🩺", a: "ตับ" },
  { q: "มนุษย์กับกล้วยหอม มี DNA ตรงกันประมาณกี่เปอร์เซ็นต์? 🧬", a: "ประมาณ 50-60%" },
  { q: "กระดูกที่เล็กที่สุดในร่างกายมนุษย์อยู่ที่ไหน? ", a: "หูชั้นกลาง (กระดูกโกลน)" },
  { q: "กรดในกระเพาะอาหารมนุษย์มีความเข้มข้นพอที่จะละลายสิ่งใดได้? ", a: "ใบมีดโกน" },
  { q: "ลายนิ้วมือของสัตว์ชนิดใดที่เหมือนมนุษย์มากจนแยกไม่ออก? ", a: "โคอาล่า" },
  { q: "หัวใจของกุ้งตั้งอยู่ที่ส่วนไหนของร่างกาย? 🦐", a: "ส่วนหัว" },
  { q: "บนดาวพฤหัสและดาวเสาร์ มีปรากฏการณ์ฝนตกลงมาเป็นอะไร? ", a: "เพชร" },
  { q: "แสงจากดวงอาทิตย์ใช้เวลานานแค่ไหนในการเดินทางมาถึงโลก? ☀️", a: "8 นาที 20 วินาที" },
  { q: "โลหะชนิดใดที่สามารถละลายได้ในฝ่ามือมนุษย์? 🫠", a: "แกลเลียม (Gallium)" },
  { q: "ในอวกาศ หากโลหะชนิดเดียวกันสัมผัสกันจะเกิดอะไรขึ้น? 🛰️", a: "เชื่อมติดกันถาวร (Cold Welding)" },
  { q: "กลิ่น 'ดิน' หลังจากฝนตก มีชื่อเรียกทางวิทยาศาสตร์ว่าอะไร? 🌧️", a: "เพทริคอร์ (Petrichor)" },
  { q: "มหาวิทยาลัยออกซ์ฟอร์ด ก่อตั้งก่อนอาณาจักรใดในอเมริกาใต้? 🏛️", a: "อาณาจักรแอซเท็ก" },
  { q: "สงครามที่สั้นที่สุดในประวัติศาสตร์ (38 นาที) คือสงครามระหว่างใคร? ⚔️", a: "อังกฤษ กับ แซนซิบาร์" },
  { q: "พีระมิดกิซ่า ถูกสร้างขึ้นในช่วงที่สัตว์ชนิดใดนังมีชีวิตอยู่? ", a: "แมมมอธ" },
  { q: "เดิมที 'ซอสมะเขือเทศ' ถูกขายในฐานะอะไรในยุคแรก? 🍅", a: "ยาแก้ท้องอืด" },
  { q: "กำแพงเมืองจีนใช้อะไรเป็นส่วนผสมในปูนเพื่อให้แข็งแรง? ", a: "ข้าวเหนียว" },
  { q: "น้ำผึ้งแท้ไม่มีวันเสีย แม้จะผ่านไปกี่ปี? ", a: "ไม่มีวันเสีย (เก็บได้เป็นพันปี)" },
  { q: "สีผสมอาหาร 'สีแดง' บางชนิดทำมาจากอะไร? ", a: "แมลง (Cochineal)" },
  { q: "เครื่องดื่ม Coca-Cola เดิมทีมีสีอะไรหากไม่ใส่สีผสมอาหาร? 🥤", a: "สีเขียว" },
  { q: "อาหารชนิดเดียวที่มดไม่กินคืออะไร? 🍭", a: "ขัณฑสกร (Saccharin)" },
  { q: "วาฬออกซิเจนจากที่ไหนมากที่สุดในโลก? ", a: "แพลงก์ตอนพืชในมหาสมุทร" },
  { q: "สัตว์ชนิดใดหายใจทางก้น? ", a: "เต่าบางสายพันธุ์" },
  { q: "หมูไม่สามารถมองเห็นสิ่งใดได้เนื่องจากสรีระคอ? ", a: "ท้องฟ้า" },
  { q: "สัตว์ชนิดใดเหงื่อออกเป็นสีชมพู? ", a: "ฮิปโปโปเตมัส" },
  { q: "นกฮูกไม่มี 'ลูกตา' แต่มีลักษณะเป็นแบบใด? ", a: "ทรงกระบอก (Tube-shaped)" },
  { q: "สัตว์ชนิดใดที่มีหัวใจ 3 ดวง และเลือดสีน้ำเงิน? ", a: "หมึกยักษ์" },
  { q: "กระต่ายกินสิ่งใดของตัวเองเพื่อให้ได้รับสารอาหารครบถ้วน? 🐰", a: "อึของตัวเอง (Soft pellets)" },
  { q: "แพนด้าเกิดใหม่มีขนาดตัวเท่ากับสัตว์ชนิดใด? ", a: "หนูแฮมสเตอร์" },
  { q: "นกชนิดใดที่บินถอยหลังได้? 🐦", a: "นกฮัมมิงเบิร์ด" },
  { q: "ดวงตาของนกกระจอกเทศมีขนาดใหญ่กว่าอะไรในร่างกาย? 👁️", a: "สมองของมัน" },
  { q: "ช้างเป็นสัตว์เลี้ยงลูกด้วยนมชนิดเดียวที่ทำสิ่งนี้ไม่ได้? 🐘", a: "กระโดด" },
  { q: "ลิ้นของปลาวาฬสีน้ำเงินมีน้ำหนักเท่ากับสัตว์ชนิดใด? 🐳", a: "ช้างหนึ่งตัว" },
  { q: "นิ้วไหนของมนุษย์ที่มีความแรงของกล้ามเนื้อมากที่สุด? ✋", a: "นิ้วก้อย (ให้พลัง 50% ของมือ)" },
  { q: "มนุษย์จะสูงขึ้นเท่าไหร่เมื่ออยู่ในอวกาศ? 👩‍🚀", a: "ประมาณ 2 นิ้ว (เพราะไม่มีแรงโน้มถ่วงกดกระดูก)" },
  { q: "ฟันของ 'หอยทาก' มีทั้งหมดประมาณกี่ซี่? 🐌", a: "มากกว่า 10,000 - 20,000 ซี่" },
  { q: "เสียงคำรามของสิงโตสามารถได้ยินไปไกลสุดกี่กิโลเมตร? 🦁", a: "8 กิโลเมตร" },
  { q: "สัตว์ชนิดเดียวที่มองเห็นสีเข้มและอ่อนผ่านกระจกเงาได้คือ? ", a: "ฉลาม" },
  { q: "ใครเป็นคนคิดค้น 'สายล่อฟ้า'? ⚡", a: "เบนจามิน แฟรงคลิน" },
  { q: "ในหนึ่งวัน หัวใจมนุษย์เต้นประมาณกี่ครั้ง? 💓", a: "100,000 ครั้ง" },
  { q: "ลูกตาของมนุษย์จะหยุดการเจริญเติบโตเมื่ออายุเท่าไหร่? 👁️‍🗨️", a: "หยุดโตตั้งแต่เกิด (ขนาดเท่าเดิมตลอดชีวิต)" },
  { q: "จมูกและหูของมนุษย์จะหยุดเจริญเติบโตเมื่อไหร่? 👃", a: "ไม่เคยหยุด (โตขึ้นเรื่อยๆ ตามอายุ)" },
  { q: "สมองของมนุษย์ประกอบด้วยน้ำกี่เปอร์เซ็นต์? 🧠", a: "75%" },
  { q: "ยอดเขาเอเวอเรสต์สูงขึ้นปีละกี่มิลลิเมตร? ⛰️", a: "4 มิลลิเมตร" },
  { q: "น้ำแข็งแห้ง (Dry Ice) ทำมาจากก๊าซชนิดใด? 🧊", a: "คาร์บอนไดออกไซด์" },
  { q: "ดาวเคราะห์ดวงใดที่หมุนตามเข็มนาฬิกาเพียงดวงเดียว? 🪐", a: "ดาวศุกร์ (Venus)" },
  { q: "ใครคือคนแรกที่เดินบนดวงจันทร์? 🌕", a: "นีล อาร์มสตรอง" },
  { q: "สัตว์ชนิดใดสามารถเปลี่ยนเพศได้ในระหว่างชีวิต? ", a: "ปลาการ์ตูน" },
  { q: "หอไอเฟลจะสูงขึ้นในฤดูร้อนเพราะอะไร? 🗼", a: "การขยายตัวของเหล็กเมื่อได้รับความร้อน" },
  { q: "ท้องฟ้าบนดาวอังคารในช่วงกลางวันมีสีอะไร? ", a: "สีชมพูแกมส้ม" },
  { q: "ตัวอักษรใดที่ไม่เคยปรากฏในตารางธาตุ? 🧪", a: "ตัว J" },
  { q: "เพชรที่แข็งที่สุดสามารถทำลายได้ด้วยสิ่งใด? ", a: "ค้อน (เพชรแข็งแต่เปราะต่อแรงกระแทก)" },
  { q: "มดสามารถแบกของหนักกว่าน้ำหนักตัวได้กี่เท่า? 🐜", a: "50 เท่า" },
  { q: "เสียงเดินทางได้เร็วที่สุดในตัวกลางชนิดใด? 🧱", a: "ของแข็ง" },
  { q: "หน่วยวัดความเผ็ดของพริกเรียกว่าอะไร? 🌶️", a: "สกอวิลล์ (Scoville)" },
  { q: "น้ำแข็งที่ขั้วโลกใต้คิดเป็นน้ำจืดกี่เปอร์เซ็นต์ของโลก? ❄️", a: "70%" },
  { q: "ท้องของอูฐเก็บสิ่งใดไว้เพื่อใช้ยามขาดแคลน? 🐪", a: "ไขมัน (ไม่ใช่เก็บน้ำในโหนก)" },
  { q: "สัญลักษณ์ @ มีชื่อเรียกอย่างเป็นทางการว่าอะไร? 📧", a: "Asperand (หรือ Commercial At)" },
  { q: "คอมพิวเตอร์เครื่องแรกของโลกมีน้ำหนักเท่าไหร่? 💻", a: "27 ตัน (ENIAC)" },
  { q: "สัตว์ชนิดใดที่นอนหลับโดยลืมตาข้างหนึ่ง? ", a: "โลมา" },
  { q: "ยุงชอบกัดคนกลุ่มเลือดใดมากที่สุด? 🦟", a: "กรุ๊ป O" },
  { q: "สิ่งประดิษฐ์ใดที่ถูกสร้างขึ้นก่อนไม้ขีดไฟ? ", a: "ไฟแช็ก" },
  { q: "เลข 1 ถึง 1,000 ถ้าเขียนเป็นตัวอักษรภาษาอังกฤษ จะไม่มีตัวอักษรใดเลยจนกว่าจะถึงพัน? 🔢", a: "ตัว A (One to Nine hundred ninety nine)" },
  { q: "ฟลามิงโก้มีสีชมพูเพราะกินอะไรเป็นอาหาร? 🦩", a: "กุ้งและสาหร่ายที่มีสารคาร์โรทีนอยด์" },
  { q: "เสียงของเป็ดมีคุณสมบัติพิเศษอะไรที่เล่าต่อกันมา (แต่เป็นความเชื่อที่ผิด)? ", a: "เสียงเป็ดไม่มีเสียงสะท้อน (จริงๆ มี)" },
  { q: "ใครเป็นผู้ออกแบบธงชาติไทย (ธงไตรรงค์)? 🇹🇭", a: "พระบาทสมเด็จพระมงกุฎเกล้าเจ้าอยู่หัว (ร.6)" },
  { q: "ไดโนเสาร์สูญพันธุ์ไปเมื่อกี่ล้านปีก่อน? 🦖", a: "66 ล้านปี" },
  { q: "แมลงสาบสามารถอยู่ได้กี่สัปดาห์หากไม่มีหัว? 🪳", a: "1-2 สัปดาห์ (จนกว่าจะอดน้ำตาย)" },
  { q: "สัตว์ชนิดใดที่กระโดดไม่ได้เลย? ", a: "ช้าง" },
  { q: "หัวใจของวาฬสีน้ำเงินมีขนาดเท่ากับสิ่งใด? 🐳", a: "รถยนต์ขนาดเล็ก" },
  { q: "ในอวกาศไม่มีเสียงเพราะเหตุใด? ", a: "ไม่มีตัวกลาง (อากาศ) ให้เสียงเดินทาง" },
  { q: "ต้นไม้ชนิดใดที่ผลิตออกซิเจนได้มากที่สุด? ", a: "ต้นสน (และพืชตระกูลสาหร่ายในทะเล)" },
  { q: "ฟันของมนุษย์ส่วนที่แข็งที่สุดเรียกว่าอะไร? 🦷", a: "เคลือบฟัน (Enamel)" },
  { q: "อวัยวะใดของร่างกายที่ทำงานหนักที่สุด? ", a: "หัวใจ" },
  { q: "นกกระจอกเทศวิ่งได้เร็วสูงสุดกี่กิโลเมตรต่อชั่วโมง? 🏃", a: "70 กิโลเมตรต่อชั่วโมง" },
  { q: "ดวงอาทิตย์มีขนาดใหญ่กว่าโลกกี่เท่า? ☀️", a: "1.3 ล้านเท่า" },
  { q: "สัตว์ชนิดใดที่จำใบหน้ามนุษย์ได้แม่นยำ? 🐦‍⬛", a: "อีกา" },
  { q: "น้ำเปล่าในร่างกายมนุษย์มีกี่เปอร์เซ็นต์? 💧", a: "60-70%" },
  { q: "ดาวเคราะห์ดวงใดที่มีดวงจันทร์มากที่สุดในระบบสุริยะ? ", a: "ดาวเสาร์ (Saturn)" },
  { q: "สีของดวงอาทิตย์จริงๆ แล้วคือสีอะไร? ", a: "สีขาว" },
  { q: "เสียงฟ้าผ่าเกิดจากอะไร? ⚡", a: "อากาศขยายตัวอย่างรวดเร็วเนื่องจากความร้อน" },
  { q: "จระเข้ไม่สามารถทำสิ่งใดได้กับลิ้นของมัน? ", a: "แลบลิ้น (เพราะลิ้นติดกับเพดานปาก)" },
  { q: "รอยแยกที่ลึกที่สุดในมหาสมุทรชื่อว่าอะไร? ", a: "ร่องลึกมาเรียนา (Mariana Trench)" },
  { q: "สัตว์ชนิดใดมีฟันมากที่สุดในโลก? ", a: "หอยทาก (หลักหมื่นซี่)" },
  { q: "โลกหมุนรอบตัวเองด้วยความเร็วกี่กิโลเมตรต่อชั่วโมง? 🌏", a: "1,670 กม./ชม. (ที่เส้นศูนย์สูตร)" },
  { q: "พืชชนิดใดที่เติบโตเร็วที่สุดในโลก? ", a: "ไผ่" },
  { q: "อุณหภูมิที่ต่ำที่สุดที่เป็นไปได้ทางฟิสิกส์เรียกว่าอะไร? 🧊", a: "ศูนย์องศาสัมบูรณ์ (Absolute Zero)" },
  { q: "ก๊าซที่ทำให้ลูกโป่งลอยได้คืออะไร? 🎈", a: "ฮีเลียม (Helium)" },
  { q: "สัตว์ชนิดใดไม่มีสมองและไม่มีหัวใจ? ", a: "แมงกะพรุน" },
  { q: "แมงมุมไม่ใช่แมลง แต่จัดเป็นสัตว์ประเภทใด? ", a: "สัตว์ขาปล้อง (Arachnid)" },
  { q: "ชื่อเกาะ 'กรีนแลนด์' ตั้งขึ้นเพื่อสิ่งใดในสมัยก่อน? 🇬🇱", a: "เพื่อหลอกล่อให้คนย้ายไปอยู่ (จริงๆ มีแต่หิมะ)" },
  { q: "ทองคำแท้มีสถานะเป็นแม่เหล็กหรือไม่? 💰", a: "ไม่เป็น (แม่เหล็กดูดไม่ติด)" },
  { q: "ดาวเคราะห์ดวงใดที่มองเห็นวงแหวนได้ชัดเจนที่สุด? ", a: "ดาวเสาร์" },
  { q: "สัตว์ชนิดใดที่ใช้เท้าในการรับรสอาหาร? ", a: "ผีเสื้อ" },
  { q: "มนุษย์กระพริบตาเฉลี่ยกี่ครั้งต่อปี? 👁️", a: "ประมาณ 4-5 ล้านครั้ง" },
  { q: "ทะเลเดดซี (Dead Sea) มีความพิเศษอย่างไร? 🌊", a: "เค็มมากจนมนุษย์ลอยน้ำได้โดยไม่ต้องว่าย" },
  { q: "สัตว์ชนิดใดที่เปลี่ยนสีผิวตามสภาพแวดล้อมได้เร็วที่สุด? ", a: "หมึกยักษ์ (Octopus)" },
  { q: "รุ้งกินน้ำมีทั้งหมดกี่สี? ", a: "7 สี" },
  { q: "สัตว์ชนิดใดที่มีอายุขัยสั้นที่สุดในโลก (24 ชม.)? ", a: "ชีปะขาว (Mayfly)" },
  { q: "ใครเป็นผู้คิดค้นหลอดไฟ? 💡", a: "โทมัส แอลวา เอดิสัน" },
  { q: "ปลาอะไรที่ว่ายน้ำเร็วที่สุดในโลก? 🐟", a: "ปลาใบขนุน (Sailfish)" },
  { q: "น้ำประกอบด้วยธาตุใดบ้าง? 💧", a: "ไฮโดรเจน และ ออกซิเจน" },
  { q: "ตารางธาตุปัจจุบันมีทั้งหมดกี่ธาตุ? 🧪", a: "118 ธาตุ" },
  { q: "เสียงเดินทางผ่านสิ่งใดไม่ได้? 🚫", a: "สูญญากาศ" },
  { q: "ใครคือผู้ค้นพบทวีปอเมริกา (ตามประวัติศาสตร์กระแสหลัก)? ⛵", a: "คริสโตเฟอร์ โคลัมบัส" },
  { q: "นกยูงตัวเมียเรียกว่าอะไรในภาษาอังกฤษ? ", a: "Peahen" },
  { q: "ทวีปใดที่ไม่มีมดอาศัยอยู่เลย? ", a: "แอนตาร์กติกา" },
  { q: "สัตว์ชนิดใดที่มีลายนิ้วมือใกล้เคียงมนุษย์ที่สุด? ", a: "โคอาล่า" },
  { q: "ใครคือนักรบที่พิชิตดินแดนได้กว้างใหญ่ที่สุดในประวัติศาสตร์? ", a: "เจงกีส ข่าน" },
  { q: "อียิปต์โบราณไม่ได้มีแค่พีระมิด แต่เป็นชาติแรกที่ประดิษฐ์สิ่งใดที่ใช้เขียน? 📜", a: "กระดาษ (ปาปิรุส)" },
  { q: "สงครามครูเสดเป็นการต่อสู้ระหว่างศาสนาใดกับศาสนาใด? ⚔️", a: "คริสต์ กับ อิสลาม" },
  { q: "สตรีคนใดที่เป็นฟาโรห์ที่ทรงอำนาจที่สุดและแต่งกายแบบชาย? 👑", a: "ฮัตเชปซุต (Hatshepsut)" },
  { q: "ในอดีต เกลือ (Salt) มีค่ามากจนถูกใช้เป็นสิ่งใด? 🧂", a: "เงินตรา (ใช้จ่ายค่าจ้างทหารโรมัน)" },
  { q: "อเมริกาซื้อรัฐอะแลสกา (Alaska) มาจากประเทศใดในราคาที่ถูกมาก? 🇷🇺", a: "รัสเซีย" },
  { q: "ใครคือผู้ที่นำทัพช้างข้ามเทือกเขาแอลป์ไปบุกโรม? 🐘", a: "แฮนนิบัล (Hannibal)" },
  { q: "ชาวไวกิ้งไม่ได้สวมหมวกที่มีสิ่งใด ตามที่หนังมักจะแสดงผิดๆ? 🛡️", a: "เขา (Horns)" },
  { q: "กรุงศรีอยุธยาเป็นราชธานีของไทยยาวนานกี่ปี? ", a: "417 ปี" },
  { q: "พระเจ้าตากสินมหาราชทรงสถาปนาเมืองใดเป็นราชธานี? 🏰", a: "กรุงธนบุรี" },
  { q: "จิ๋นซีฮ่องเต้สั่งสร้างสิ่งใดเพื่ออารักขาสุสานของพระองค์? 🏺", a: "กองทัพทหารดินเผา (Terracotta Army)" },
  { q: "มหาวิทยาลัยที่เก่าแก่ที่สุดในโลกที่ยังเปิดอยู่จนถึงปัจจุบันอยู่ที่ไหน? ", a: "โมร็อกโก (Al Quaraouiyine)" },
  { q: "ใครคือผู้ประดิษฐ์แท่นพิมพ์ (Printing Press) ที่เปลี่ยนโลกการอ่าน? 📖", a: "โยฮันเนส กูเทนแบร์ค" },
  { q: "ก่อนจะเป็นสหรัฐอเมริกา ดินแดนนี้เคยมีกี่รัฐตอนประกาศเอกราช? ", a: "13 รัฐ" },
  { q: "กษัตริย์องค์ใดของฝรั่งเศสที่มีฉายาว่า 'สุริยกษัตริย์' (The Sun King)? ☀️", a: "พระเจ้าหลุยส์ที่ 14" },
  { q: "ประเทศใดที่เป็นชาติแรกในโลกที่ให้สิทธิสตรีในการเลือกตั้ง? ", a: "นิวซีแลนด์" },
  { q: "การล่มสลายของกรุงคอนสแตนติโนเปิลนำไปสู่การสิ้นสุดของอาณาจักรใด? 🏛️", a: "อาณาจักรไบแซนไทน์" },
  { q: "สงครามโลกครั้งที่ 1 สิ้นสุดลงในปี ค.ศ. ใด? 🎖️", a: "ค.ศ. 1918" },
  { q: "อารยธรรมแรกที่คิดค้นตัวเลข '0' คืออารยธรรมใด? 🧮", a: "มายา (หรืออินเดียโบราณ)" },
  { q: "ใครคือสตรีที่ทรงอิทธิพลที่สุดในยุควิกตอเรียของอังกฤษ? 👸", a: "พระนางเจ้าวิกตอเรีย" },
  { q: "ในยุคกลาง ความตายสีดำ (Black Death) มีสาเหตุมาจากอะไร? 🐀", a: "กาฬโรค (แพร่โดยเห็บหนู)" },
  { q: "จักรวรรดิใดที่เคยครองพื้นที่มากที่สุดในโลก (ไม่ใช่ต่อเนื่องกัน)? ", a: "จักรวรรดิอังกฤษ (British Empire)" },
  { q: "นครวัด (Angkor Wat) เดิมทีสร้างขึ้นเพื่อบูชาเทพเจ้าในศาสนาใด? 🛕", a: "พราหมณ์-ฮินดู" },
  { q: "ญี่ปุ่นปิดประเทศไม่คบค้ากับต่างชาตินานกว่า 200 ปีในยุคใด? ⛩️", a: "ยุคเอโดะ (โชกุนโทกุงาวะ)" },
  { q: "กำแพงเบอร์ลินถูกทำลายลงในปี ค.ศ. ใด? 🧱", a: "ค.ศ. 1989" },
  { q: "ใครคือผู้เขียนคำประกาศเอกราชของสหรัฐอเมริกา? ✒️", a: "โทมัส เจฟเฟอร์สัน" },
  { q: "ไททานิค (Titanic) จมลงในการเดินทางครั้งที่เท่าไหร่? 🚢", a: "ครั้งแรก" },
  { q: "สงครามฝิ่น (Opium Wars) เกิดขึ้นระหว่างประเทศใดกับประเทศใด? ", a: "จีน กับ อังกฤษ" },
  { q: "พระนางคลีโอพัตราจริงๆ แล้วมีเชื้อสายมาจากชาติใด? ", a: "กรีก (มาซิโดเนีย)" },
  { q: "ใครคือผู้พิชิตอาณาจักรแอซเท็ก? ⚔️", a: "เอร์นัน กอร์เตส" },
  { q: "การปฏิวัติฝรั่งเศสเริ่มต้นด้วยการบุกทำลายสถานที่ใด? 🗼", a: "คุกบาสตีย์" },
  { q: "กษัตริย์องค์แรกของอาณาจักรสุโขทัยคือใคร? ", a: "พ่อขุนศรีอินทราทิตย์" },
  { q: "สงครามเย็น (Cold War) เป็นการขับเคี่ยวระหว่างอุดมการณ์ใด? 🇰🇷", a: "ทุนนิยม กับ คอมมิวนิสต์" },
  { q: "ใครคือบุคคลที่พบศิลาโรเซตตา (Rosetta Stone) ที่ช่วยถอดรหัสอักษรอียิปต์? ", a: "ทหารของนโปเลียน" },
  { q: "กรุงกรุงรัตนโกสินทร์สถาปนาขึ้นในปี พ.ศ. ใด? 🏯", a: "พ.ศ. 2325" },
  { q: "ระบอบสมบูรณาญาสิทธิราชย์ของไทยสิ้นสุดลงในรัชกาลใด? 👑", a: "รัชกาลที่ 7" },
  { q: "ใครคือประธานาธิบดีคนแรกของสหรัฐอเมริกา? ", a: "จอร์จ วอชิงตัน" },
  { q: "อเล็กซานเดอร์มหาราช สิ้นพระชนม์เมื่อพระชนมายุเท่าไหร่? ⚔️", a: "32 พรรษา" },
  { q: "เหตุการณ์ใดที่เป็นจุดเริ่มต้นของสงครามโลกครั้งที่ 2? 🛰️", a: "เยอรมนีบุกโปแลนด์" },
  { q: "อาณาจักรโรมันถูกแบ่งออกเป็นกี่ส่วนก่อนล่มสลาย? 🏛️", a: "2 ส่วน (ตะวันตกและตะวันออก)" },
  { q: "ใครคือนักเดินเรือคนแรกที่เดินทางรอบโลกสำเร็จ (แม้จะตายก่อนถึง)? 🌏", a: "เฟอร์ดินานด์ มาเจลลัน" },
  { q: "เส้นทางสายไหม (Silk Road) เชื่อมต่อระหว่างภูมิภาคใด? 🐪", a: "เอเชีย กับ ยุโรป" },
  { q: "ชาวสุเมเรียนเป็นกลุ่มแรกที่ประดิษฐ์อักษรชนิดใด? ✒️", a: "อักษรรูปลิ่ม (Cuneiform)" },
  { q: "สงครามเก้าทัพเกิดขึ้นในรัชสมัยใดของไทย? 🇹🇭", a: "รัชกาลที่ 1" },
  { q: "ใครคือผู้ประกาศเลิกทาสในประเทศไทย? ⛓️", a: "รัชกาลที่ 5" },
  { q: "เมืองใดที่ถูกทำลายด้วยระเบิดปรมาณูเป็นเมืองแรก? ☢️", a: "ฮิโรชิมา" },
  { q: "นักวิทยาศาสตร์คนใดถูกคริสตจักรลงโทษเพราะบอกว่าโลกหมุนรอบดวงอาทิตย์? 🔭", a: "กาลิเลโอ กาลิเลอี" },
  { q: "เครื่องบินลำแรกของโลกบินได้นานกี่วินาที? ✈️", a: "12 วินาที" },
  { q: "ก่อนจะเป็นชื่อ 'ตุรกี' ประเทศนี้เคยเป็นศูนย์กลางของจักรวรรดิใด? 🕌", a: "จักรวรรดิออตโตมัน" }
];

export default function Home() {
  const [name, setName] = useState('')
  const [step, setStep] = useState('NAME')
  const [roomCode, setRoomCode] = useState('')
  const [myId] = useState(nanoid(4))
  const [players, setPlayers] = useState<any[]>([])
  const [gameData, setGameData] = useState<any>(null)
  const [timer, setTimer] = useState(60)
  const [selectedTime, setSelectedTime] = useState(60)
  const [usedQuestionIndexes, setUsedQuestionIndexes] = useState<number[]>([])
  const pusherRef = useRef<Pusher | null>(null);

  const playSound = (type: 'click' | 'ding' | 'success') => {
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  const sendSignal = async (event: string, data: any) => {
    try {
      await fetch('/api/pusher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, roomCode, data })
      });
    } catch (err) { console.error("Signal Error:", err); }
  }

  const getNextQuestion = useCallback(() => {
    let availableIndexes = QUESTIONS_POOL.map((_, i) => i).filter(i => !usedQuestionIndexes.includes(i));
    if (availableIndexes.length === 0) {
      availableIndexes = QUESTIONS_POOL.map((_, i) => i);
      setUsedQuestionIndexes([]);
    }
    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    setUsedQuestionIndexes(prev => [...prev, randomIndex]);
    return QUESTIONS_POOL[randomIndex];
  }, [usedQuestionIndexes]);

  const startNewRound = useCallback((currentGuesserId: string, queue: string[], currentPlayers: any[]) => {
    const others = currentPlayers.filter(p => p.id !== currentGuesserId);
    if (others.length < 2) {
      alert("⚠️ ต้องการผู้เล่นอย่างน้อย 3 คน");
      return;
    }
    const bluePlayer = others[Math.floor(Math.random() * others.length)];
    const question = getNextQuestion();
    sendSignal('game-started', {
      guesserId: currentGuesserId,
      blueId: bluePlayer.id,
      question,
      startTime: selectedTime,
      speakerIndex: 0,
      speakers: others.map(p => p.id).sort(() => Math.random() - 0.5),
      phase: 'SPEAKING',
      queue,
      eliminatedIds: [],
      roundPoints: 0
    });
  }, [selectedTime, roomCode, getNextQuestion]);

  const isEveryoneReady = players.length >= 3 && players.every(p => p.isReady);

  const handleGuess = (targetId: string) => {
    playSound('click');
    const isBlue = targetId === gameData.blueId;
    if (isBlue) {
      sendSignal('round-ended', { reason: 'HIT_BLUE', caughtId: targetId, eliminatedIds: gameData.eliminatedIds });
    } else {
      const newEliminated = [...gameData.eliminatedIds, targetId];
      const newPoints = gameData.roundPoints + 1;
      if (newEliminated.length === players.length - 2) {
        sendSignal('round-ended', { reason: 'CLEARED_RED', eliminatedIds: newEliminated, pointsAwarded: newPoints + 1 });
      } else {
        sendSignal('guess-correct', { eliminatedIds: newEliminated, roundPoints: newPoints });
      }
    }
  }

  useEffect(() => {
    if (!roomCode) return;
    if (!pusherRef.current) pusherRef.current = new Pusher("c8dd0c376bfaa5d569b0", { cluster: 'ap1' });
    const channel = pusherRef.current.subscribe(`room-${roomCode}`);

    channel.bind('check-room', (data: any) => {
      if (players.find(p => p.id === myId)?.isHost) {
        sendSignal('player-joined', { id: data.requesterId, name: data.name, isHost: false, isReady: false, score: 0 });
      }
    });

    channel.bind('player-joined', (newP: any) => {
      setPlayers(prev => {
        if (prev.find(p => p.id === newP.id)) return prev;
        const updated = [...prev, newP];
        if (prev.find(p => p.id === myId)?.isHost) sendSignal('sync-players', updated);
        return updated;
      });
      setStep('LOBBY');
    });

    channel.bind('sync-players', (list: any) => setPlayers(list));
    channel.bind('player-ready', (id: string) => setPlayers(prev => prev.map(p => p.id === id ? {...p, isReady: !p.isReady} : p)));
    channel.bind('game-started', (data: any) => { setGameData(data); setTimer(data.startTime); setStep('PLAYING'); playSound('ding'); });
    channel.bind('next-turn', (data: any) => { setGameData((prev: any) => ({ ...prev, speakerIndex: data.speakerIndex })); setTimer(selectedTime); playSound('ding'); });
    channel.bind('guessing-phase', () => setGameData((prev: any) => ({ ...prev, phase: 'GUESSING' })));
    channel.bind('guess-correct', (data: any) => setGameData((prev: any) => ({ ...prev, eliminatedIds: data.eliminatedIds, roundPoints: data.roundPoints })));
    channel.bind('round-ended', (data: any) => {
      setPlayers(prev => prev.map(p => {
        let added = 0;
        const totalFishOnTable = prev.length - 1; 
        const eliminatedIds = data.eliminatedIds || [];
        const isHitBlue = data.reason === 'HIT_BLUE';
        const totalFlipped = isHitBlue ? eliminatedIds.length + 1 : eliminatedIds.length;
        const unflippedCount = totalFishOnTable - totalFlipped;
        if (p.id === gameData.guesserId) {
          added = isHitBlue ? 0 : (data.pointsAwarded || gameData.roundPoints);
        } else if (p.id !== gameData.blueId) {
          const wasFlipped = isHitBlue ? (eliminatedIds.includes(p.id) || data.caughtId === p.id) : eliminatedIds.includes(p.id);
          added = wasFlipped ? 0 : totalFlipped; 
        } else if (p.id === gameData.blueId) {
          added = isHitBlue ? 0 : unflippedCount;
        }
        return { ...p, score: (p.score || 0) + added, lastAdded: added };
      }));
      setGameData((prev: any) => ({ ...prev, phase: 'ROUND_RESULT', result: data }));
    });
    channel.bind('final-leaderboard', () => { setStep('FINAL_SCORE'); playSound('success'); });
    return () => { channel.unbind_all(); pusherRef.current?.unsubscribe(`room-${roomCode}`); };
  }, [roomCode, myId, gameData, players, selectedTime]);

  useEffect(() => {
    if (step === 'PLAYING' && gameData?.phase === 'SPEAKING' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer, gameData?.phase]);

  const me = players.find(p => p.id === myId);
  const isHost = me?.isHost;
  const guesserIndex = gameData?.queue?.indexOf(gameData?.guesserId);
  const isFinalRound = guesserIndex === players.length - 1;

  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_#020617_100%)] text-white flex flex-col items-center justify-center p-4 font-sans">
      
      {/* 🚀 STEP: NAME */}
      {step === 'NAME' && (
        <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl text-center animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-6">🐠</div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent italic">FISHY AND CHIPS</h1>
          <p className="text-slate-500 text-sm mb-8 font-bold tracking-widest uppercase">เกมของ "พวกเรา 1.2"</p>
          <input type="text" placeholder="ชื่อของคุณ..." className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-2xl mb-6 text-center text-xl outline-none focus:ring-2 ring-cyan-500 transition-all shadow-inner" onChange={(e) => setName(e.target.value)} maxLength={12} />
          <button disabled={!name} onClick={() => { playSound('click'); setStep('MENU'); }} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-4 rounded-2xl font-black text-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition-all disabled:opacity-50">เข้าร่วมเกม</button>
        </div>
      )}

      {/* 🏠 STEP: MENU */}
      {step === 'MENU' && (
        <div className="flex flex-col gap-6 w-full max-w-sm animate-in slide-in-from-bottom duration-500">
          <button onClick={() => { playSound('click'); setRoomCode(nanoid(6).toUpperCase()); setPlayers([{id:myId, name, isHost:true, isReady:true, score:0}]); setStep('LOBBY') }} className="bg-slate-900/80 backdrop-blur-md py-12 rounded-[3rem] font-black text-3xl shadow-xl hover:bg-slate-800 border border-white/5 transition-all group overflow-hidden relative">
            <span className="relative z-10">สร้างห้องใหม่ 🏰</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <div className="flex items-center gap-4 px-2">
            <input type="text" placeholder="รหัสห้อง" className="flex-1 bg-slate-900/80 p-5 rounded-2xl text-center text-2xl font-mono uppercase border border-slate-800 focus:border-blue-500 outline-none transition-all" onChange={(e) => setRoomCode(e.target.value.toUpperCase())} />
            <button onClick={() => { playSound('click'); if(roomCode) sendSignal('check-room', { requesterId: myId, name }); }} className="bg-blue-600 p-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-lg active:scale-90">จอย 🤝</button>
          </div>
        </div>
      )}

      {/* ⏳ STEP: LOBBY */}
      {step === 'LOBBY' && (
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/10 shadow-2xl animate-in zoom-in duration-500">
          <div className="text-center mb-8">
            <p className="text-cyan-500 font-black text-xs uppercase tracking-[0.3em] mb-2">Room Code</p>
            <h2 className="text-6xl font-black font-mono tracking-tighter">{roomCode}</h2>
          </div>
          <div className="space-y-3 mb-10 min-h-[200px]">
            {players.map(p => (
              <div key={p.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${p.id === myId ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/5'}`}>
                <span className="font-bold text-lg flex items-center gap-2">
                  {p.isHost ? '👑' : '👤'} {p.name}
                </span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${p.isReady ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {p.isReady ? 'READY' : 'WAITING'}
                </span>
              </div>
            ))}
          </div>
          <button 
            disabled={isHost ? !isEveryoneReady : false}
            onClick={() => {
              playSound('click');
              if(isHost) {
                const q = players.map(p=>p.id).sort(()=>Math.random()-0.5);
                startNewRound(q[0], q, players);
              } else { sendSignal('player-ready', myId); }
            }} 
            className={`w-full py-6 rounded-[2rem] font-black text-2xl transition-all shadow-xl ${
              isHost 
                ? (isEveryoneReady ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed')
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20'
            }`}
          >
            {isHost 
              ? (isEveryoneReady ? 'เริ่มเกมเดี๋ยวนี้! 🎮' : 'รอทุกคนพร้อม...') 
              : (me?.isReady ? 'ยกเลิกพร้อม ❌' : 'ฉันพร้อมแล้ว ✨')}
          </button>
        </div>
      )}

      {/* 🎮 STEP: PLAYING */}
      {step === 'PLAYING' && gameData && (
        <div className="w-full max-w-2xl text-center">
          
          {/* ส่วนแสดงรายชื่อคนทาย (The Detective) */}
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-500">
            <div className="inline-flex items-center gap-3 bg-orange-500/20 border border-orange-500/40 px-6 py-2 rounded-full backdrop-blur-md">
              <span className="text-xl">🕵️</span>
              <p className="font-black text-sm uppercase tracking-widest text-orange-400">
                ผู้ทายรอบนี้: <span className="text-white">{players.find(p => p.id === gameData.guesserId)?.name}</span>
              </p>
            </div>
          </div>

          {gameData.phase === 'SPEAKING' && (
            <div className="mb-10 animate-in fade-in duration-700">
              <div className={`text-[10rem] font-black leading-none mb-4 font-mono transition-all ${timer < 10 ? 'text-red-500 scale-110' : 'text-white/20'}`}>{timer}</div>
              <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-full shadow-2xl">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <p className="font-bold tracking-widest uppercase text-sm">ผู้พูด: <span className="text-cyan-400 font-black">{players.find(p=>p.id===gameData.speakers[gameData.speakerIndex])?.name}</span></p>
              </div>
              {myId === gameData.speakers[gameData.speakerIndex] && (
                <button onClick={() => {
                  playSound('click');
                  const nextIdx = gameData.speakerIndex + 1;
                  if (nextIdx < gameData.speakers.length) sendSignal('next-turn', { speakerIndex: nextIdx });
                  else sendSignal('guessing-phase', {});
                }} className="block w-full mt-10 bg-emerald-500 py-8 rounded-[2.5rem] font-black text-4xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all border-b-8 border-emerald-700">พูดจบแล้ว! ✅</button>
              )}
            </div>
          )}

          <div className="bg-slate-900/90 backdrop-blur-3xl p-10 rounded-[4rem] border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 left-4 text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Question {guesserIndex + 1}/{players.length}</div>
            <h2 className="text-4xl font-bold mb-12 leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">"{gameData.question.q}"</h2>

            {/* ส่วนแสดงบทบาทของตัวเอง (Personal Role) */}
            <div className="bg-white/5 p-8 rounded-[3rem] mb-10 border border-white/5 shadow-inner">
              {myId === gameData.guesserId ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-5xl animate-bounce">🕵️</span>
                  <p className="text-orange-400 font-black text-xl uppercase tracking-widest">คุณคือคนทาย (The Detective)</p>
                  <p className="text-slate-500 text-xs mt-2">ฟังคนอื่นให้ดี แล้วทายว่าใครคือปลาแดงที่โกหก!</p>
                </div>
              ) : (
                <div className="animate-in slide-in-from-top duration-500">
                   <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-[0.3em]">เฉลยคำตอบจริง</p>
                   <p className="text-5xl font-black text-emerald-400 italic mb-6 tracking-tighter">{gameData.question.a}</p>
                   
                   <div className="flex flex-col items-center gap-3 border-t border-white/5 pt-6">
                     {myId === gameData.blueId ? (
                       <div className="bg-blue-500/10 border border-blue-500/40 py-4 px-8 rounded-3xl">
                         <p className="text-blue-400 font-black text-lg uppercase tracking-widest flex items-center gap-2">🔵 บทบาท: THE BLUE KIPPER</p>
                         <p className="text-blue-300/60 text-[11px] mt-1 italic font-medium">"คุณต้องพูดความจริงตามคำตอบสีเขียวข้างบน"</p>
                       </div>
                     ) : (
                       <div className="bg-red-500/10 border border-red-500/40 py-4 px-8 rounded-3xl">
                         <p className="text-red-400 font-black text-lg uppercase tracking-widest flex items-center gap-2">🔴 บทบาท: THE RED HERRING</p>
                         <p className="text-red-300/60 text-[11px] mt-1 italic font-medium">"คุณต้องโกหกเนียนๆ อย่าให้นักสืบจับได้!"</p>
                       </div>
                     )}
                   </div>
                </div>
              )}
            </div>

            {gameData.phase === 'GUESSING' && myId === gameData.guesserId && (
              <div className="space-y-6 animate-in zoom-in duration-500">
                <p className="text-white/40 font-black text-sm uppercase tracking-widest">เลือกคนที่คุณคิดว่า "โกหก" (ปลาแดง)</p>
                <div className="grid grid-cols-2 gap-4">
                  {players.filter(p => p.id !== myId && !gameData.eliminatedIds?.includes(p.id)).map(p => (
                    <button key={p.id} onClick={() => handleGuess(p.id)} className="bg-slate-800 p-8 rounded-[2rem] font-black text-2xl hover:bg-red-600 hover:scale-105 transition-all shadow-xl border-b-4 border-black/40">
                      {p.name}
                    </button>
                  ))}
                </div>
                {gameData.roundPoints > 0 && (
                  <button onClick={() => sendSignal('round-ended', { reason: 'STOPPED', pointsAwarded: gameData.roundPoints })} className="w-full mt-6 bg-emerald-600 py-6 rounded-2xl font-black text-xl shadow-lg">พอแค่นี้! เก็บ {gameData.roundPoints} แต้ม 💰</button>
                )}
              </div>
            )}

            {gameData.phase === 'ROUND_RESULT' && (
              <div className="py-4 animate-in slide-in-from-bottom duration-500">
                <div className="mb-10 p-10 bg-black/40 rounded-[3.5rem] border border-white/10">
                   <h3 className="text-xl font-black text-slate-500 mb-2 uppercase tracking-widest">แต้มของคุณในรอบนี้</h3>
                   <p className={`${me?.lastAdded > 0 ? 'text-emerald-400' : 'text-red-500'} font-black text-9xl tracking-tighter`}>+{me?.lastAdded}</p>
                </div>
                {isHost && (
                  <button onClick={() => {
                    if (isFinalRound) sendSignal('final-leaderboard', {});
                    else startNewRound(gameData.queue[guesserIndex + 1], gameData.queue, players);
                  }} className="w-full bg-cyan-600 py-6 rounded-3xl font-black text-2xl shadow-xl hover:bg-cyan-500 transition-all border-b-4 border-cyan-800">
                    {isFinalRound ? 'สรุปผลคะแนนรวม 🏆' : 'รอบถัดไป ⏭️'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🏆 STEP: FINAL SCORE */}
      {step === 'FINAL_SCORE' && (
        <div className="w-full max-w-md bg-slate-900 p-10 rounded-[4rem] border border-white/10 shadow-2xl text-center animate-in zoom-in duration-700">
           <h2 className="text-5xl font-black text-cyan-500 mb-10 italic uppercase tracking-tighter">Leaderboard</h2>
           <div className="space-y-4 mb-10">
             {players.sort((a,b) => (b.score || 0) - (a.score || 0)).map((p, i) => (
               <div key={p.id} className={`flex justify-between items-center p-6 rounded-[2.5rem] border-2 ${i === 0 ? 'bg-cyan-500/10 border-cyan-500 scale-105 shadow-2xl shadow-cyan-500/20' : 'bg-white/5 border-white/5 opacity-80'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🐟'}</span>
                    <span className="text-2xl font-black">{p.name}</span>
                  </div>
                  <span className="text-4xl font-black text-cyan-400">{p.score || 0}</span>
               </div>
             ))}
           </div>
           <button onClick={() => window.location.reload()} className="w-full bg-slate-800 py-4 rounded-3xl font-black opacity-40 hover:opacity-100 transition-all">กลับหน้าแรก</button>
        </div>
      )}
    </main>
  )
}
