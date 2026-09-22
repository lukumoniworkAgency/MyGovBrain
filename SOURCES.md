# Week 2 Official Sources

Research date: 2026-09-22

Only official government sources are listed. No secondary source is used as a source of truth.

| Service | Official source | Verified findings | Data status |
| --- | --- | --- | --- |
| Income Certificate | https://edistrict.assam.gov.in/eDistrict/ | Assam e-District exposes application status and approved-certificate lookup. Service-specific eligibility, documents, fees, and process were not available in the extracted public page. | needs_review |
| Caste Certificate | https://edistrict.assam.gov.in/eDistrict/ | Assam e-District exposes application status and approved-certificate lookup. Service-specific eligibility, documents, fees, and process were not available in the extracted public page. | needs_review |
| Domicile/Residence Certificate | https://edistrict.assam.gov.in/eDistrict/ | Assam e-District exposes application status and approved-certificate lookup. Service-specific eligibility, documents, fees, and process were not available in the extracted public page. | needs_review |
| Birth Certificate | https://dc.crsorgi.gov.in/ | The official CRS portal states that birth registration is mandatory in India and lists Assam among supported states. The portal links official procedural and requisite-document PDFs; those documents require further review before extracting requirements. | needs_review |
| Old Age Pension | https://sspensions.assam.gov.in/ | Official Assam pension portal identified, but its public content was not extractable for reliable eligibility, documents, fees, or process. | needs_review |
| Land Record/Mutation | https://revenueassam.nic.in/ | Official Assam Revenue Department and Dharitree portal identified, but the public content was not extractable for reliable requirements. | needs_review |
| Learner's/Driving Licence | https://parivahan.gov.in/ and https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do | Official Parivahan and Sarathi portals expose learner/driving licence services, state selection, online tests, and appointments. Exact Assam requirements and fees require further review. | needs_review |
| Ration Card/PDS | https://fcsca.assam.gov.in/information-services/detail/how-to-apply-for-ration-cards | Assam FPD&CA states that AAY and PHH cards are issued under NFSA, applications go to the district/subdivision FPD&CA authority, and lists document requirements for new, duplicate, separate, inclusion/deletion, and address cases. | verified |

## Inserted data

Only Ration Card/PDS has been inserted in Week 2 migration `20260922000500_seed_verified_ration_card.sql`.

The inserted English facts are limited to the official page. Fees and deadlines are null because the source does not establish a universal amount or deadline. The Hindi translation is a machine-assisted draft and must be reviewed before it is presented as final. `verified_by` remains null because no database user UUID was supplied for the content operator.
