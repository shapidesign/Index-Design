import { museumWorkPatch } from '../src/lib/museumWork.js';

const blank = museumWorkPatch({ title: '  ', student_name: 'נועה' });
if (blank.ok) throw new Error('blank title should fail');

const saved = museumWorkPatch({
  title: 'x'.repeat(200),
  student_name: '  נועה  ',
  tags: ' א , א , ב ',
  course: 'פרויקט אישי',
  user_id: 'should-not-pass',
});
if (!saved.ok) throw new Error('valid draft should save');
if (saved.row.title.length !== 160) throw new Error('title cap');
if (saved.row.student_name !== 'נועה') throw new Error('name trim');
if (saved.row.tags.join() !== 'א,ב') throw new Error('tags');
if ('user_id' in saved.row) throw new Error('user_id must stay off the patch');

console.log('museumWorkPatch ok');
