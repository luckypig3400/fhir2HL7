const fs = require('fs');
const path = require('path');

// Function to convert FHIR patient to HL7 message
function fhirToHl7(patient) {
  const mshSegment = `MSH|^~\\&|${patient.meta.source}|${patient.meta.versionId}|${patient.meta.lastUpdated}|${patient.meta.profile[0]}|${patient.meta.security[0].code}|${patient.meta.tag[0].code}||ADT^A01|${patient.id}|P|2.3|||NE|AL|USA\r`;

  const pidSegment = `PID|||${patient.id}^^^${patient.identifier[0].system}|${patient.name[0].family[0]}^${patient.name[0].given[0]}^${patient.name[0].middle[0]}||${patient.gender}|${patient.birthDate}|${patient.address[0].line[0]}^^${patient.address[0].city}^${patient.address[0].state}^${patient.address[0].postalCode}^${patient.address[0].countryCode}||||||||||||||||||\r`;

  return mshSegment + pidSegment;
}

// Function to read a file and convert its contents to HL7 format
function convertFile(filePath) {
  const data = fs.readFileSync(filePath);
  const patient = JSON.parse(data);
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
