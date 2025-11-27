import { extractJobFromUrl } from "../utils/web/extractJobFromUrl";

(async () => {
  const url =
    "https://www.linkedin.com/jobs/view/4335115271/?alternateChannel=search&eBP=CwEAAAGaw9mpC8QDUM7md8dtXgDlCLhXTP9dp0zeSKfUbT3UWf5n3YfHxdtdHMVtMZLBGJRZBs2huA6R3wOxdUboLKAMZLbWeaPC_bsMWgL_Up7mkHL7_HRgXYSgIEEBW1cnHS5tUWAS9kQCWIoGl-NskNYg_aigZ3HL9svwSCeQLdgtZr02CBUffs6Lf90rZqcKGkQ_eorLQjqyw6WXXKMfTgGTVF7gcQUMg1sW0_8gIOXHPjTyl2-KvWV2_FCXDi-uTfPNADKiJVkVS4Qv1Uw8heDlfOiT1t23EVtzCjnKjpxmkh7JmO_hv4AIevHt4XfW2rkQx-v3HtBOGt9cItcVsMoiDwPAEmOerlhinC6k4oXKCLCOjm6uIoyo0CT2Ak3qJcafzCaALLe-yUfRZ-i0lMpQdBf4XwlpdwDv3dL-gKndo3TzrMxqtslK3Whso3BVDpdOIaa2Ngjc_DV41dYGmMzr_mGbFk1596l65fW_v5h8JpmnV372CipvA1q1L1X9H8xpzvL2KF-vHA&refId=yk5LT4lF%2BRyVOONm0SG1Uw%3D%3D&trackingId=Kou0Oi6do9tHld7kFkyEFA%3D%3D";
  const title = "Javascript Developer";
  const company = "Envision";

  const result = await extractJobFromUrl(url, title, company);
  console.log(result);
})();
