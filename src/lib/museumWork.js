/** Fields an admin may change on a museum work. user_id stays off the patch. */
export function museumWorkPatch(draft) {
  const title = String(draft?.title || '').trim().slice(0, 160);
  const studentName = String(draft?.student_name || '').trim().slice(0, 120);
  if (!title || !studentName) {
    return { ok: false, error: 'יש להזין שם עבודה ושם סטודנט' };
  }

  const seen = new Set();
  const tags = String(draft?.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => {
      if (!tag || seen.has(tag)) return false;
      seen.add(tag);
      return true;
    })
    .slice(0, 12);

  return {
    ok: true,
    row: {
      title,
      student_name: studentName,
      course: String(draft?.course || '').trim(),
      study_year: String(draft?.study_year || '').trim(),
      teacher: String(draft?.teacher || '').trim(),
      description: String(draft?.description || '').trim(),
      tags,
      link: String(draft?.link || '').trim(),
      image_url: String(draft?.image_url || '').trim(),
    },
  };
}
