const fs = require('fs');
const path = require('path');

const convertResultsDir = 'convertResults';

// Function to convert FHIR patient to HL7 message
function fhirToHl7(patient) {
  try {
    const source = patient.meta?.source ?? 'UNKNOWN';
    const versionId = patient.meta?.versionId ?? '1';
    const lastUpdated = patient.meta?.lastUpdated ?? new Date().toISOString();
    const profile = patient.meta?.profile?.[0] ?? 'DEFAULT';
    const securityCode = patient.meta?.security?.[0]?.code ?? 'DEFAULT';
    const tagCode = patient.meta?.tag?.[0]?.code ?? 'DEFAULT';
    const id = patient.id ?? 'UNKNOWN';
    const system = patient.identifier?.[0]?.system ?? 'UNKNOWN';
    const familyName = patient.name?.[0]?.family?.[0] ?? 'UNKNOWN';
    const givenName = patient.name?.[0]?.given?.[0] ?? 'UNKNOWN';
    const middleName = patient.name?.[0]?.middle?.[0] ?? '';
    const gender = patient.gender ?? 'U';
    const birthDate = patient.birthDate ?? '';
    const addressLine = patient.address?.[0]?.line?.[0] ?? '';
    const city = patient.address?.[0]?.city ?? '';
    const state = patient.address?.[0]?.state ?? '';
    const postalCode = patient.address?.[0]?.postalCode ?? '';
    const countryCode = patient.address?.[0]?.countryCode ?? '';

    const mshSegment = `MSH|^~\\&|${source}|${versionId}|${lastUpdated}|||DEFAULT|DEFAULT|DEFAULT|ADT^A01|${patient.id}|P|2.5.1|||NE|AL|USA|ASCII|2.5.1\r`;
    const pidSegment = `PID|||${id}^^^${system}||${familyName}^${givenName}^${middleName}||${birthDate}|${gender}|||${addressLine}^^${city}^${state}^${postalCode}^${countryCode}|||||||||||||||||\r`;

    return mshSegment + pidSegment;
  } catch (error) {
    console.error(`Error converting FHIR to HL7 message: ${error}`);
    return '';
  }
}

// Function to read a file and convert its contents to HL7 format
function convertFile(filePath) {
  const data = fs.readFileSync(filePath);
  let patient;
  try {
    patient = JSON.parse(data);
  } catch (err) {
    console.error(`Error parsing JSON file: ${filePath}`);
    console.error(err);
    return;
  }
  const hl7 = fhirToHl7(patient);
  const fileName = path.basename(filePath, '.json') + '.hl7';
  const outputFilePath = path.join(convertResultsDir, fileName);
  try {
    fs.mkdirSync(convertResultsDir, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory: ${convertResultsDir}`);
    console.error(err);
    return;
  }
  fs.writeFileSync(outputFilePath, hl7);
}

// Function to watch the toBeConvert folder for changes
function watchFolder(folderPath) {
  console.log(`Watching folder for changes: ${folderPath}`);
  fs.watch(folderPath, (eventType, filename) => {
    if (filename) {
      console.log(`Detected change in file: ${filename}`);
      const filePath = path.join(folderPath, filename);
      convertFile(filePath);
    }
  });
}

// Watch the toBeConvert folder for changes
watchFolder('toBeConvert');