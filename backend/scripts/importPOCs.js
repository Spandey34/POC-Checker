const xlsx =
  require('xlsx');

const mongoose =
  require('mongoose');

const POC =
  require('./../src/models/POC');

require('dotenv').config();

const BRANCHES = [
  'CSE',
  'ECE',
  'EE',
  'ECM',
  'MECH',
  'CIVIL',
  'PIE',
  'MME',
];

const generateAcronyms = (
  name
) => {
  const words = name
    .trim()
    .split(/\s+/);

  if (words.length <= 1) {
    return [];
  }

  return [
    words
      .map((w) => w[0])
      .join('')
      .toLowerCase(),
  ];
};

const run = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      'MongoDB connected'
    );

    const workbook =
      xlsx.readFile(
        './POC_Branch_Wise_2k26.xlsx'
      );

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const data =
      xlsx.utils.sheet_to_json(
        sheet,
        {
          header: 1,
        }
      );

    const headers = data[0];

    const docs = [];

    for (
      let col = 0;
      col < headers.length;
      col++
    ) {
      const branch =
        headers[col];

      if (
        !BRANCHES.includes(
          branch
        )
      )
        continue;

      for (
        let row = 1;
        row < data.length;
        row++
      ) {
        const name =
          data[row][col];

        if (!name) continue;

        docs.push({
          name:
            String(name).trim(),

          nameLower:
            String(name)
              .toLowerCase()
              .trim(),

          aliases: [],

          acronyms:
            generateAcronyms(
              String(name)
            ),

          branch,

          addedBy:
  new mongoose.Types.ObjectId(
    '6a088185d5fd8db9c21499a3'
  ),
        });
      }
    }

    console.log(
      `Preparing ${docs.length} docs`
    );

    await POC.deleteMany({});

    await POC.insertMany(docs);

    console.log(
      'POCs imported successfully'
    );

    process.exit(0);
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
};

run();