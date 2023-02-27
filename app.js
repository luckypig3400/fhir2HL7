const fs = require('fs');
const path = require('path');

// Function to convert FHIR patient to HL7 message
function fhirToHl7(patient) {
  try {
    const source = patient.meta?.source ?? '';
    const versionId = patient.meta?.versionId ?? '';
    const lastUpdated = patient.meta?.lastUpdated ?? '';
    const profile = patient.meta?.profile?.[0] ?? '';
    const securityCode = patient.meta?.security?.[0]?.code ?? '';
    const tagCode = patient.meta?.tag?.[0]?.code ?? '';
    const id = patient.id ?? '';
    const system = patient.identifier?.[0]?.system ?? '';
    const familyName = patient.name?.[0]?.family?.[0] ?? '';
    const givenName = patient.name?.[0]?.given?.[0] ?? '';
    const middleName = patient.name?.[0]?.middle?.[0] ?? '';
    const gender = patient.gender ?? '';
    const birthDate = patient.birthDate ?? '';
    const addressLine = patient.address?.[0]?.line?.[0] ?? '';
    const city = patient.address?.[0]?.city ?? '';
    const state = patient.address?.[0]?.state ?? '';
    const postalCode = patient.address?.[0]?.postalCode ?? '';
    const countryCode = patient.address?.[0]?.countryCode ?? '';

    const mshSegment = `MSH|^~\\&|${source}|${versionId}|${lastUpdated}|||${profile}|${securityCode}|${tagCode}|ADT^A01|${id}|P|2.5.1|||NE|AL|USA|ASCII|2.5.1\r`;
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
  const outputFilePath = path.join('convertResults', fileName);
  fs.writeFileSync(outputFilePath, hl7);
}

// Read all the files in the toBeConvert folder and convert them
const files = fs.readdirSync('toBeConvert');
for (const file of files) {
  const filePath = path.join('toBeConvert', file);
  convertFile(filePath);
}
