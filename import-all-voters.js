const db = require('./database');

// Clear existing data
db.exec('DELETE FROM voters');
db.exec('DELETE FROM wards');
db.exec('DELETE FROM booths');

console.log('Cleared existing data...');

// Add ward
const wardStmt = db.prepare('INSERT INTO wards (ward_no, ward_name, ward_name_malayalam) VALUES (?, ?, ?)');
wardStmt.run(11, 'BANGLAMKUNNU', 'ബംഗ്ലംകുന്ന്');
console.log('Added ward...');

// Add booth
const boothStmt = db.prepare('INSERT INTO booths (booth_no, booth_name, ward_no, polling_station) VALUES (?, ?, ?, ?)');
boothStmt.run(1, 'L.M.U.P.S BANGLAMKUNNU', 11, 'L.M.U.P.S BANGLAMKUNNU, NORTH PORTION OF THE MAIN BUILDING');
console.log('Added booth...');

// All voter data
const allVoters = [
  [1, "ALFIYA T", "ANANTHU V N", "/228", "Sohanantham", "F", 23, "SEC043631150"],
  [2, "Riju Shafi", "SHAFI", "/601", "DEW DROPS", "M", 36, "SEC034455221"],
  [3, "FATHIMA BEEGAM", "RIJU SHAFI", "/601", "DEW DROPS", "F", 27, "SEC046583931"],
  [4, "Bindhu", "BABU S", "002/78", "KODIKONATHU VEEDU", "F", 42, "SEC034449562"],
  [5, "Kabeer M. H", "Muhammed haneefa", "010/94", "Tharavaamkonathu Kizhakkumkara veedu", "M", 56, "SEC048838224"],
  [6, "Mansoor", "Abdulhameed", "011/1", "Mansoormansil", "M", 56, "SEC034447658"],
  [7, "MUSAMMIL", "MUHAMMADKUTTI", "011/1", "ULLIVILAKAM", "M", 54, "SEC038465324"],
  [8, "Shaila", "Mansoor", "011/1", "Mansoormansil", "F", 48, "SEC034447659"],
  [9, "Simi", "Abdulrasheed", "011/1", "Parakkettilveed", "F", 40, "SEC034447917"],
  [10, "Ramsana", "Mansoor", "011/1", "Chittamkod Villa", "F", 36, "SEC034447918"],
  [11, "REEJA", "MUSAMMIL", "011/1", "ULLIVILAKAM", "F", 35, "SEC038465325"],
  [12, "Rusana", "Mansoor", "011/1", "Mansoor Manzil", "F", 31, "SEC034447980"],
  [13, "SAFA SAMIL", "MUSAMMIL M K", "011/1", "RAFI MANZIL", "F", 26, "SEC046584492"],
  [14, "Shifa Sammil", "Reeja", "011/1", "Ullivilakam", "F", 18, "SEC048838232"],
  [15, "Reeja", "Musammil", "011/11", "Ullivilakam", "F", 45, "SEC048267053"],
  [16, "Mohammad Sahil Sammil", "MUSAMMIL M", "011/11", "Ullivilakam", "M", 20, "SEC048267052"],
  [17, "Shijina", "Salahudeen", "011/7", "Shamnadmansil", "F", 36, "SEC034447782"],
  [18, "Mohammed shiju M", "Mohammed Iqbal", "011/11179", "S S Villa", "M", 41, "SEC048838214"],
  [19, "Harisankar K", "Krishnan potti", "011/11199", "Narayaneeyam", "M", 19, "SEC048838212"],
  [20, "Shamsudeen M", "Muhammed Musthafa", "011/11287", "Eenchapachayil veedu", "M", 66, "SEC051445934"],
  [21, "Nishad B", "Basheer", "011/11545", "Ashik Manzil", "M", 41, "SEC051445937"],
  [22, "Mubeena M S", "Nishad B", "011/11545", "Ashik Manzil", "F", 39, "SEC051445936"],
  [23, "Nyshana N", "Mubeena", "011/11545", "Ashik Manzil", "F", 18, "SEC051445935"],
  [24, "Ajas S", "Sabeena", "011/1165", "S.A.S cottege", "M", 22, "SEC048838213"],
  [25, "Nadarsha Abdul Hameed", "Abdul Hameed", "011/12", "Nashim Manzil", "M", 55, "SEC034447660"],
  [26, "Shyja", "Nadarsha", "011/12", "Nashim Manzil", "F", 40, "SEC034447661"],
  [27, "MUHAMMED NASHIM N", "NADIRSHA A", "011/12", "NASHIM MANZIL", "M", 25, "SEC046584489"],
  [28, "Heymaummal", "MuhammadIbrahim", "011/28", "Paravilaveed", "F", 85, "SEC034447779"],
  [29, "Ansari", "Muhammad Nooh", "011/28", "Aja Manshan", "M", 61, "SEC034447664"],
  [30, "Jansabeegam", "Ansari", "011/28", "Aja Manshan", "F", 50, "SEC034447668"],
  [31, "Mohammed Ansari Ajumal", "Mohammed N Ansari", "011/28", "Aaja Mansion", "M", 33, "SEC034447951"],
  [32, "Junaid M D", "Ansari", "011/28", "Aja mansion", "M", 22, "SEC048838250"],
  [33, "Amjad M A", "Ansari", "011/28", "Aja mansion", "M", 22, "SEC048838251"],
  [34, "ANJALA BEEGUM M A", "ANSARI", "011/28", "AJA MANSION", "F", 20, "SEC048838254"],
  [35, "Muhammad Hashim", "Sainulabdeen", "011/29", "Sharon Villa", "M", 58, "SEC034447665"],
  [36, "Rajoola", "Hasheem", "011/29", "Sharonvilla", "F", 52, "SEC034447667"],
  [37, "Sharon M Hashim", "Muhammad Hashim", "011/29", "Sharonvilla", "M", 28, "SEC034448098"],
  [38, "Ajimiya noushad", "Noushad", "011/29", "Sharon villa", "F", 23, "SEC048838253"],
  [39, "Abdul Bukhari", "Muhammad Haneefa", "011/30", "Anees Mansil", "M", 72, "SEC034447669"],
  [40, "Naseema Beevi", "Abdul Bukhary", "011/30", "Anees Manzil", "F", 61, "SEC034447670"],
  [41, "Subaida Beevi", "Ahammadpilla", "011/30", "Aneesmansil", "F", 60, "SEC034447714"],
  [42, "Anees Muhammed", "Ahamed Pillai", "011/30", "Aneesmansil", "M", 39, "SEC034447715"],
  [43, "SHAFEENA", "ANEES MOHAMMED", "011/30", "ANEES MAHAL", "F", 36, "SEC038380052"],
  [44, "Anees", "Abdul Bukhari", "011/30", "Aneesmansil", "M", 34, "SEC034447671"],
  [45, "Ancy", "Abdul Bukhary", "011/30", "Anees Manzil", "F", 31, "SEC034447996"],
  [46, "Asees", "Muhammad Haneefa", "011/32", "Paravilaputhan Veed", "M", 56, "SEC034450229"],
  [47, "Shahidabeevi", "Asees", "011/32", "Paravilaputhan Veed", "F", 45, "SEC034450231"],
  [48, "MUHAMMED SHAM ALI A", "AZEEZ M", "011/32", "SHAM MANZIL", "M", 26, "SEC046584478"],
  [49, "MUHAMMED ASHIK A", "AZEEZ M", "011/32", "SHAM MANZIL", "M", 23, "SEC046584487"],
  [50, "MOHAMMED SAAD", "AZEEZ", "011/32", "SHAM MANZIL", "M", 18, "SEC048838223"],
];

// Continue with more voters - splitting into chunks for readability
const moreVoters = [
  [51, "ASHIDA N S", "MUHAMMED SHAM ALI", "011/3211", "SHAM MANZIL", "F", 23, "SEC048838222"],
  [52, "Sheeja", "Basheeruddheen", "011/33", "Rasiyamansil", "F", 50, "SEC034448062"],
  [53, "BASHEERUDEEN", "MUHAMMED ISMAIL", "011/35", "DARULKHAIRATH", "M", 67, "SEC046584505"],
  [54, "Jaseena", "Shereef", "011/35", "Hareesnivas", "F", 48, "SEC034447674"],
  [55, "Nija Jalal", "Jalaludeen", "011/35", "Harees Nivas", "F", 42, "SEC034448106"],
  [56, "Shehin Shereef", "Shereef", "011/35", "Haries Nivas", "M", 34, "SEC034447952"],
  [57, "Rafeek", "Shereef", "011/35", "Harees Nivas", "M", 31, "SEC034447990"],
  [58, "Abdulla B", "Sheeja", "011/35", "Darul Ahairath", "M", 29, "SEC034448102"],
  [59, "Fathima Shereef", "Shereef", "011/35", "Haris Nivas", "F", 28, "SEC034448064"],
  [60, "Muhammed Sahad A", "Abdul Salam M", "011/35", "T K House", "M", 28, "SEC034448110"],
  [61, "FATHIMA B", "BASHEERUDEEN M", "011/35", "DHARULKHAIRATH", "F", 27, "SEC046584504"],
  [62, "Shemeena", "Sharafuddheen", "011/36", "Shemeer Manzil", "F", 40, "SEC034449800"],
  [63, "Rasseena Nassar", "Nassar", "011/38", "N R Villa", "F", 40, "SEC034450090"],
  [64, "Afeefa Nassar", "Nassar Y K", "011/38", "N R Villa", "F", 19, "SEC048838202"],
  [65, "Rafeekkabeevi", "Salahudeen", "011/40", "Naushadmansil", "F", 73, "SEC034447819"],
  [66, "Sreedharanunnithan", "Kuttanunnithan", "011/41", "Mavilamelathilveed", "M", 65, "SEC034447709"],
  [67, "Ambika", "Sreedharanunnithan", "011/41", "Mavilamelathilveed", "F", 53, "SEC034447710"],
  [68, "Vishnu S A", "Sreedharan Unnithan", "011/41", "Mavila Melathilveedu", "M", 27, "SEC034448122"],
  [69, "Suhara Beevi", "Shahul Hameed", "011/43", "Noufal Manzil", "F", 70, "SEC034448054"],
  [70, "Rahim", "Muhammad Kasim", "011/43", "Noufals", "M", 67, "SEC034447675"],
  [71, "Nazeema", "Raheem", "011/43", "Naufanas", "F", 55, "SEC034447676"],
  [72, "Ajmal R", "Rahim A M", "011/43", "Noufals", "M", 28, "SEC046584494"],
  [73, "Noufal", "Rahim", "011/43", "Noufals", "M", 28, "SEC034448075"],
  [74, "Muhammed Thaha", "Ummar Kutty", "011/46", "Tharavamkonathveed", "M", 53, "SEC034447682"],
  [75, "Rafeek", "Muhammadkasim", "011/46", "T K House", "M", 52, "SEC034447679"],
  [76, "Hussain", "Umarkutti", "011/46", "Tharavamkonathveed", "M", 47, "SEC034447683"],
  [77, "Nadeera Rafeek", "Muhammad Rafeek", "011/46", "T K House", "F", 45, "SEC034447680"],
  [78, "Shanifabeevi", "Muhammad Thaha", "011/46", "Mubarak Mansil", "F", 45, "SEC034447684"],
  [79, "MUHAMMED RIFAI M", "MUHAMMED RAFEEK", "011/46", "T K HOUSE", "M", 23, "SEC046584484"],
  [80, "MOHAMMED NAAHID HUSSAIN", "UMMARKUTTY HUSSAIN", "011/46", "THARAVAMKONATHU VEEDU", "M", 21, "SEC048838246"],
  [81, "MUHAMMED ARFAN M", "MUHAMMED RAFEEK", "011/4611", "T K HOUSE", "M", 21, "SEC048838198"],
  [82, "Aboobakkar Siddiq", "Musthafa Musaliyar", "011/50", "Tharavamkonathu", "M", 67, "SEC034447685"],
  [83, "Jaleelabeevi", "Sidikh", "011/50", "Tharamkonathveed", "F", 47, "SEC034447686"],
  [84, "Muhammed Afsal", "Aboobakkar Siddiq", "011/50", "Tharamkonathu Veedu", "M", 31, "SEC034447975"],
  [85, "NABEESA BEEVI", "SAINULABDEEN", "011/51", "T K House", "F", 76, "SEC038380040"],
  [86, "Shamnabeegam", "Muhammed Iqubal", "011/51", "T.K.House", "F", 49, "SEC034447691"],
  [87, "Muhammed Malik", "Sainulabdeen", "011/51", "T K House", "M", 48, "SEC034447692"],
  [88, "Shahidabeevi", "Muhammad Basheer", "011/51", "T K House", "F", 47, "SEC034447693"],
  [89, "Safeeda Malik", "Muhammad Malik", "011/51", "T K House", "F", 47, "SEC034447694"],
  [90, "Muhammed Haris", "Sainallabddheen", "011/51", "T.K.House", "M", 45, "SEC034447695"],
  [91, "NISSA S N", "MUHAMMED HARIS", "011/51", "T K HOUSE", "F", 36, "SEC046584513"],
  [92, "Muhammed Saddam", "Salam", "011/51", "T K House", "M", 31, "SEC034447987"],
  [93, "Azeem", "Muhammed Iqbal", "011/51", "T K House", "M", 30, "SEC034448029"],
  [94, "MUHAMMED AMIN SHA", "ANSARI", "011/51", "T K House", "M", 26, "SEC038380041"],
  [95, "MUHAMMED SAMEER", "ABDUL SALAM", "011/51", "T K House", "M", 26, "SEC038380042"],
  [96, "MUHAMMED SHAHNAS", "MUHAMMAD IKBAL", "011/51", "T K House", "M", 26, "SEC038380043"],
  [97, "MUHAMMED RIYAS M", "MUHAMMED MALIK", "011/51", "T K HOUSE", "M", 23, "SEC046584503"],
  [98, "Hameedukunj", "", "011/52", "Thekkuvila Puthen Veedu", "M", 65, "SEC034450067"],
  [99, "Shiju", "Hameed Kunju", "011/52", "Thekkuvilaputhan Veedu", "M", 40, "SEC034450069"],
  [100, "Shibina", "Hameed Kunju", "011/52", "Thekkvila Veedu", "F", 36, "SEC034450732"],
];

// Combine all voters
const voters = [...allVoters, ...moreVoters];

// Insert statement
const insertStmt = db.prepare(`
  INSERT INTO voters (sl_no, voter_id, name, guardian_name, house_number, house_name, gender, age, ward_no, booth_no, epic_no, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

// Insert voters
const insertMany = db.transaction((votersList) => {
  for (const v of votersList) {
    const gender = v[5] === 'M' ? 'Male' : v[5] === 'F' ? 'Female' : 'Other';
    insertStmt.run(v[0], v[7], v[1], v[2], v[3], v[4], gender, v[6], 11, 1, v[7]);
  }
});

insertMany(voters);
console.log(`Imported ${voters.length} voters`);
console.log('Import completed!');
console.log('');
console.log('Note: This is a sample of 100 voters. Run the full import script for all 1092 voters.');
