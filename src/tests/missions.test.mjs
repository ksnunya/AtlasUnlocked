import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const React = require('react');
const { act } = React;

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' });
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLSelectElement', 'Event', 'MouseEvent', 'KeyboardEvent', 'localStorage']) globalThis[key] = dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = require('react-dom/client');
const { GameStateProvider, useGameState } = require('../state/GameState.tsx');
const { ExpeditionApp } = require('../pages/Index.tsx');
const { initialMissions, initialInventory, initialNotes } = require('../data/gameData.ts');
const { initialMissionRun } = require('../data/missionContent.ts');
const KEY = 'world-prep-academy-phase3';
let state, root;
function Probe() { state = useGameState(); return null; }
async function mount(save) {
  if (root) await act(async () => root.unmount());
  if (save !== undefined) { localStorage.clear(); if (save) localStorage.setItem(KEY, JSON.stringify(save)); }
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(GameStateProvider, null, React.createElement(ExpeditionApp), React.createElement(Probe)))); assertCampaignPresentation();
}
function assertCampaignPresentation() {
  const active = state.missions.filter(m=>m.state==='active'); assert.ok(active.length <= 1); if(active.length) assert.equal(active[0].id,state.selectedMission.id);
  const map=document.querySelector('.mission-map'); if(!map)return;
  const card=document.querySelector('aside[data-mission-id]'); assert.equal(card.dataset.missionId,state.selectedMission.id);assert.equal(card.dataset.missionState,state.selectedMission.state);
  const current=map.querySelectorAll('[aria-current="step"]');assert.equal(current.length,1);assert.equal(current[0].dataset.missionId,state.selectedMission.id);
  for(const mission of state.missions){const marker=map.querySelector(`[data-mission-id="${mission.id}"]`);assert.equal(marker.dataset.missionState,mission.state);assert.ok(marker.textContent.includes(mission.title));assert.ok(marker.textContent.includes(mission.location));assert.ok(marker.textContent.includes(`Mission ${mission.number}`));assert.ok(marker.textContent.includes(`${mission.objectives.filter(o=>o.complete).length}/${mission.objectives.length} objectives`));}
  assert.doesNotMatch(map.textContent,/sample|placeholder|demo|future content/i);
}
function button(text, scope) {
  scope ??= document.querySelector('[role="dialog"]') ?? document.querySelector('.fixed.inset-0.z-40.flex.flex-col') ?? document;
  const result = [...scope.querySelectorAll('button')].find((node) => node.textContent.trim() === text || node.getAttribute('aria-label') === text || node.querySelector('b')?.textContent.trim() === text);
  assert.ok(result, `Button exists: ${text}`); return result;
}
async function click(text, scope) {
  const node = typeof text === 'string' ? button(text, scope) : text;
  assert.equal(node.disabled, false, `Button enabled: ${node.textContent}`);
  await act(async () => node.click()); assertCampaignPresentation();
}
async function input(node, value) {
  assert.ok(node, 'Input exists');
  const proto = node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  await act(async () => { Object.getOwnPropertyDescriptor(proto, 'value').set.call(node, value); node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true })); });
}
async function radio(text) {
  const scope = document.querySelector('[role="dialog"]') ?? document.querySelector('.fixed.inset-0.z-40.flex.flex-col') ?? document;
  const label = [...scope.querySelectorAll('label')].find((node) => node.textContent.trim() === text);
  assert.ok(label, `Choice exists: ${text}`); await act(async () => label.querySelector('input').click());
}
async function addNote(text) {
  await click('Notebook'); const scope = document.querySelector('.fixed.inset-0.z-40.flex.flex-col .journal-page').parentElement;
  await click('Add note', scope); await input(scope.querySelector('input'), text); await click('Save note', scope); await click('Close notebook');
}
async function reload() { const before = JSON.parse(localStorage.getItem(KEY)); await mount(); assert.deepEqual(JSON.parse(localStorage.getItem(KEY)), before); }

const ids = ['base-camp', 'cedar-pass', 'northwind', 'glacier-relay', 'echo-canyon'];
function visibleMission() { return document.querySelector('.fixed.inset-0.z-40.flex.flex-col'); }
async function open(id) { const mission = state.missions.find((m) => m.id === id); await click(`${mission.nodeLabel}, ${mission.state}`); }
async function completionPanel() { await click([...document.querySelectorAll('footer button')].find((b) => b.querySelector('span')?.textContent === 'Complete Mission')); }
async function hints() { await click('Hints & explanations'); while ([...document.querySelectorAll('[role="dialog"] button')].some((b) => b.textContent === 'Show next hint level')) await click('Show next hint level'); await click('Close panel'); }
async function packRequired() {
  for (const id of state.selectedMission.supplyIds) {
    const item = state.inventory.find((i) => i.id === id);
    const card = [...document.querySelectorAll('.mission-workspace .rounded-lg')].find((el) => el.querySelector('b')?.textContent === item.name);
    assert.ok(card, `Supply checklist has ${item.name}`);
    if (!item.available) await click('Missing', card);
    if (!state.inventory.find((i) => i.id === id).packed) await click('Pack item', card);
  }
}
async function inventoryCard(id) {
  await click('Inventory'); const item = state.inventory.find((i) => i.id === id);
  await click(item.category === 'Physical' ? 'Physical supplies' : 'In-game equipment');
  return [...document.querySelectorAll('[role="dialog"] .rounded-md')].find((el) => el.querySelector('p')?.textContent.startsWith(item.name));
}
async function changePacked(id, desired) { const card = await inventoryCard(id); const item = state.inventory.find((i) => i.id === id); if (item.packed !== desired) await click(item.packed ? 'Packed' : 'Not packed', card); await click('Close panel'); }
async function resumeAndReload(id) {
  const before = structuredClone(state.missionRun); await click('Save and return to map'); await reload(); await open(id);
  assert.equal(state.missionRun.stage, before.stage); assert.deepEqual(state.missionRun.completedTasks, before.completedTasks); assert.deepEqual(state.missionRun.answers, before.answers);
}
async function finish(id, index) {
  assert.ok(state.selectedMission.objectives.every((o) => o.complete), `${id}: every objective achieved`);
  assert.equal(state.overlay, 'complete');
  await click('Continue mission'); await changePacked(state.selectedMission.supplyIds[0], false);
  await click('Open mission review'); assert.equal(button('Finish mission & return to map').disabled, true, 'Unpacking blocks completion');
  await click('Continue mission'); await changePacked(state.selectedMission.supplyIds[0], true); await click('Open mission review');
  assert.equal(button('Finish mission & return to map').disabled, false);
  const supplies = structuredClone(state.inventory); const notes = structuredClone(state.notes);
  const node = button('Finish mission & return to map'); await act(async () => { node.click(); node.click(); node.click(); });
  assert.equal(state.selectedMission.state, 'completed'); assert.equal(state.selectedMission.progress, 100); assert.equal(state.overlay, null); assert.equal(state.missionRun.open, false); assert.equal(state.activeView, 'Map');
  assert.deepEqual(state.inventory, supplies, 'Completion does not consume or duplicate equipment'); assert.deepEqual(state.notes, notes, 'Repeated finish creates no duplicate notes/rewards');
  assert.equal(state.missions.filter((m) => m.state === 'completed').length, index + 1);
  if (index < ids.length - 1) assert.equal(state.missions.find((m) => m.id === ids[index + 1]).state, 'available');
  assert.ok(state.missions.slice(index + 2).every((m) => m.state === 'locked'));
  await reload(); assert.equal(state.selectedMission.state, 'completed');
  await open(id); assert.equal(state.overlay, 'complete'); await click('Return to map'); assert.equal(state.missionRun.open, false);
  assert.deepEqual(state.inventory, supplies); assert.deepEqual(state.notes, notes);
}
const expectedTasks = {
  'base-camp': [{ kind: 'choice', wrong: 'Low creek bank', answer: 'Flat clearing above the creek', note: true }, { kind: 'number', wrong: '7', answer: '12' }, { kind: 'action', label: 'Organize supplies' }],
  'cedar-pass': [{ kind: 'choice', wrong: '270 degrees', answer: '090 degrees' }, { kind: 'number', wrong: '3', answer: '6' }, { kind: 'choice', wrong: 'Flooded creek shortcut', answer: 'East ridge to the marker', note: true }],
  'glacier-relay': [{ kind: 'choice', wrong: 'Short steep western ascent', answer: 'Gentle eastern ridge' }, { kind: 'number', wrong: '6', answer: '3' }, { kind: 'action', label: 'Install relay' }, { kind: 'number', wrong: '3', answer: '1' }],
  'echo-canyon': [{ kind: 'choice', wrong: 'Narrow western slot', answer: 'Wide eastern ledge' }, { kind: 'number', wrong: '10', answer: '24', note: true }],
};
async function genericMission(id) {
  const tasks = expectedTasks[id];
  await click('Begin mission route'); assert.equal(button('Previous objective').disabled, true);
  for (let index = 0; index < tasks.length; index++) {
    const task = tasks[index];
    const next = index === tasks.length - 1 ? 'Review mission' : 'Next objective';
    assert.equal(button(next).disabled, true);
    if (task.kind !== 'action') {
      if (task.kind === 'choice') await radio(task.wrong); else await input(document.querySelector('.task-card input[aria-label]'), task.wrong);
      await click('Check answer'); assert.equal(state.selectedMission.objectives[index].complete, false); assert.equal(button(next).disabled, true);
      await hints();
      if (task.kind === 'choice') await radio(task.answer); else await input(document.querySelector('.task-card input[aria-label]'), task.answer);
      if (task.note) { await click('Check answer'); assert.equal(state.selectedMission.objectives[index].complete, false, 'A new mission note is required'); await addNote(`${id}: observed the safe route and measurements.`); }
      await click('Check answer');
    } else {
      await changePacked(state.selectedMission.supplyIds[0], false); assert.equal(button(task.label).disabled, true);
      await changePacked(state.selectedMission.supplyIds[0], true);
      const action = button(task.label); await act(async () => { action.click(); action.click(); action.click(); });
    }
    assert.equal(state.selectedMission.objectives[index].complete, true);
    if (id === 'base-camp' && index === 2) { const video = visibleMission().querySelector('video'); assert.ok(video.getAttribute('src').endsWith('make-a-fire.mp4')); assert.equal(video.controls, true); }
    if (id === 'glacier-relay' && index === 1) await addNote('Glacier: three hours remain before the weather limit.');
    assert.equal(new Set(state.missionRun.completedTasks).size, state.missionRun.completedTasks.length);
    await reload();
    if (index > 0) { await click('Previous objective'); assert.equal(button('Next objective').disabled, false); await click('Next objective'); }
    await resumeAndReload(id);
    await click(next);
    if (index === 0 && tasks.length > 1) { await click('Back'); assert.equal(state.missionRun.stage, 'route'); await click('Back'); assert.equal(state.missionRun.stage, 'supplies'); await click('Confirm supply review'); await click('Begin mission route'); assert.equal(state.missionRun.objectiveIndex, 1); }
  }
}
async function northwind() {
  for (const subject of ['Physical Science', 'Introduction to Geography', 'Grade 8 Language Arts', 'Pre-Algebra', 'American Sign Language I']) await click([...document.querySelectorAll('.mission-workspace button')].find((b) => b.querySelector('b')?.textContent === subject));
  await click('Continue to field route'); await click('Back'); await click('Continue to field route'); await click('Begin at Trailhead');
  assert.equal(button('Add note to continue').disabled, true); await click('Check answers'); assert.match(document.body.textContent, /Choose an answer/);
  await radio('Southwest'); await radio('Deep snow'); await click('Check answers'); assert.equal(button('Add note to continue').disabled, true); await hints();
  await radio('Northeast'); await radio('A washed-out creek section'); await click('Check answers'); await click('Add note to continue'); assert.equal(state.missionRun.stage, 'trailhead');
  await addNote('Northwind: take the higher eastern trail.'); await resumeAndReload('northwind'); await click('Continue');
  assert.equal(state.selectedMission.objectives[0].complete, true);
  for (const [index, correct, wrong] of [[0, 'The person is checking whether they can assist you.', 'The person wants you to assist them.'], [1, 'Where are you from?', 'How are you?'], [2, "What's wrong?", 'Nice to meet you.']]) {
    const next = index === 2 ? 'Continue' : 'Next ASL clip';
    const submit = index === 0 ? 'Check answer' : 'Interpret sign';
    const video = visibleMission().querySelector('video');
    if (index === 0) {
      assert.equal(video, null);
      assert.equal(visibleMission().querySelector('fieldset legend').textContent, 'What does ‘Do you need help?’ mean?');
      assert.equal(visibleMission().querySelectorAll('input[type="radio"]').length, 4);
    } else {
      assert.equal(video.getAttribute('aria-label'), `ASL exercise ${index + 1}`);
      assert.equal(video.controls, true);
    }
    assert.equal(button(next).disabled, true); await click(submit); await radio(wrong); await click(submit); assert.equal(button(next).disabled, true);
    await click('Hint'); await click('Show next hint level'); await click('Close panel'); await radio(correct);
    if (index === 0) {
      const selected = visibleMission().querySelector('input[type="radio"]:checked');
      selected.focus();
      assert.equal(document.activeElement, selected);
      await act(async () => selected.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      assert.equal(state.missionRun.attempts['asl-need-help'], 2);
      assert.ok(state.missionRun.completedTasks.includes('asl-need-help'));
    } else {
      const check = button(submit); await act(async () => { check.click(); check.click(); check.click(); });
    }
    assert.equal(button(submit).disabled, true); await resumeAndReload('northwind'); await click(next);
  }
  assert.equal(button('Continue to station').disabled, true); await click('Check'); await input(document.querySelector('input[placeholder="Area"]'), '10'); await click('Check');
  await input(document.querySelector('input[placeholder="Area"]'), '12'); await click('Check'); await radio('Tool case: 9.2 kg'); await click('Check load'); assert.equal(button('Continue to station').disabled, true);
  await radio('Radio kit: 6.5 kg'); await click('Check load'); await resumeAndReload('northwind'); await click('Continue to station'); assert.equal(state.selectedMission.objectives[1].complete, true);
  await click('Complete checkpoint'); assert.equal(state.missionRun.stage, 'station');
  for (const system of ['Backup Power', 'Antenna Relay', 'Weather Sensor']) await click([...document.querySelectorAll('.mission-workspace button')].find((b) => b.querySelector('span')?.textContent.startsWith(system)));
  await input(document.querySelectorAll('.mission-workspace select')[0], 'power'); await input(document.querySelectorAll('.mission-workspace select')[1], 'radio'); await radio('Thin foil'); await click('Check material'); await click('Complete checkpoint'); assert.equal(state.missionRun.stage, 'station');
  await input(document.querySelectorAll('.mission-workspace select')[0], 'antenna'); await input(document.querySelectorAll('.mission-workspace select')[1], 'toolkit'); await radio('Wool wrap'); await click('Check material');
  await click('Complete checkpoint'); assert.equal(state.missionRun.stage, 'station', 'Station note is required');
  await changePacked('toolkit', false); assert.equal(document.querySelector('.mission-workspace option[value="toolkit"]').disabled, true); await changePacked('toolkit', true);
  await addNote('Northwind: the antenna connector is loose.'); const baseline = state.missionRun.stationNoteBaselineIds;
  await click('Back'); await click('Continue to station'); assert.deepEqual(state.missionRun.stationNoteBaselineIds, baseline); await resumeAndReload('northwind'); await click('Complete checkpoint');
  assert.equal(state.missionRun.stage, 'summary');
}

await test('Entire fresh campaign: all five missions completed solely through player controls', async () => {
  await mount(null); await click('Skip'); assert.equal(state.selectedMission.id, 'base-camp'); assert.equal(state.missions.filter((m) => m.state === 'completed').length, 0);
  assert.deepEqual(state.missions.map((m) => m.number), ['01', '02', '04', '05', '06']);
  for (const id of ids.slice(1)) { await open(id); assert.equal(state.selectedMission.id, 'base-camp'); assert.match(state.notice, /unlock/); }
  await completionPanel(); assert.equal(button('Finish mission & return to map').disabled, true); await click('Close panel');
  for (let index = 0; index < ids.length; index++) {
    const id = ids[index]; await open(id); assert.equal(state.missionRun.stage, 'intro');
    await click('Return to map'); await reload(); await click('Continue mission'); await click('Review supplies'); await click('Save and return to map'); await completionPanel(); assert.equal(button('Finish mission & return to map').disabled, true); await click('Continue mission');
    if (id === 'base-camp') {
      assert.equal(button('Confirm supply review').disabled, true);
      const card = await inventoryCard('water'); await input(card.querySelector('input[aria-label="Water bottle quantity"]'), '0'); assert.equal(button('Not packed', card).disabled, true);
      await input(card.querySelector('input[aria-label="Water bottle quantity"]'), '1'); await click('Close panel');
      await click('Field Lab'); await click('Equipment'); assert.equal(button('Prepare signal relay').disabled, true); await click('Return to Map / Mission');
    }
    if (id === 'glacier-relay') {
      assert.equal(button('Confirm supply review').disabled, true); await click('Field Lab'); await click('Equipment');
      const prepare = button('Prepare signal relay'); const before = structuredClone(state.inventory.filter((i) => i.id !== 'relay'));
      await act(async () => { prepare.click(); prepare.click(); prepare.click(); }); assert.equal(button('Signal relay prepared').disabled, true); assert.equal(state.inventory.find((i) => i.id === 'relay').quantity, '1'); assert.deepEqual(state.inventory.filter((i) => i.id !== 'relay'), before); await click('Return to Map / Mission');
    }
    await packRequired(); await click('Confirm supply review');
    if (id === 'northwind') await northwind(); else await genericMission(id);
    await finish(id, index);
    if (id === 'base-camp') {
      await click('FIELD LAB, lab'); assert.equal(button('Analyze insulation').disabled, true); await radio('Thin foil'); await click('Analyze insulation'); assert.equal(state.lab.experimentCompleted, false);
      await radio('Wool wrap'); const analyze = button('Analyze insulation'); const count = state.notes.length; await act(async () => { analyze.click(); analyze.click(); analyze.click(); }); assert.equal(state.notes.length, count + 1); assert.equal(button('Experiment recorded').disabled, true); await click('Lab Notes'); await click('Open shared lab notes'); assert.equal(state.activeView, 'Notebook'); await click('Map'); await reload();
    }
  }
  assert.ok(state.missions.every((m) => m.state === 'completed')); assert.match(document.body.textContent, /5 \/ 5 missions completed/); assert.doesNotMatch(document.body.textContent, /620|1,000 XP|sample mission|future sample/);
  await click('Progress'); assert.match(document.body.textContent, /All five missions completed/); await reload(); assert.ok(state.missions.every((m) => m.state === 'completed'));
});

function legacySave() {
  return structuredClone({ missions: initialMissions.map((m) => ['base-camp', 'cedar-pass'].includes(m.id) ? { ...m, state: 'completed', progress: 100, objectives: m.objectives.map((o) => ({ ...o, complete: true })) } : m.id === 'northwind' ? { ...m, state: 'active', progress: 55 } : m), selectedMissionId: 'northwind', inventory: initialInventory, notes: initialNotes, missionRun: { ...initialMissionRun, stage: 'cache', open: false, answers: { area: '12' }, completedTasks: ['reading-direction', 'reading-hazard', 'trail-note', 'asl', 'area'], noteBaseline: initialNotes.length }, tutorialCompleted: true });
}
await test('Legacy single Northwind save migrates without losing achievements, notes, custom inventory or unfinished tasks', async () => {
  const save = legacySave(); save.inventory.push({ ...initialInventory[0], id: 'custom-old', custom: true, name: 'Old supply' }); save.notes.push({ id: 'old-note', category: 'Clues', text: 'Keep this note.' });
  await mount(save); assert.equal(state.missions[0].state, 'completed'); assert.equal(state.missions[1].state, 'completed'); await open('northwind'); assert.equal(state.missionRun.stage, 'cache'); assert.equal(document.querySelector('input[placeholder="Area"]').value, '12');
  assert.ok(state.inventory.some((i) => i.id === 'custom-old')); assert.ok(state.notes.some((n) => n.id === 'old-note')); await click('Save and return to map'); await open('base-camp'); await click('Return to map'); await open('northwind'); assert.equal(state.missionRun.stage, 'cache'); await reload();
  await radio('Radio kit: 6.5 kg'); await click('Check load'); await click('Continue to station'); await packToolsForLegacy();
  for (const system of ['Backup Power', 'Antenna Relay', 'Weather Sensor']) await click([...document.querySelectorAll('.mission-workspace button')].find((b) => b.querySelector('span')?.textContent.startsWith(system)));
  await input(document.querySelectorAll('.mission-workspace select')[0], 'antenna'); await input(document.querySelectorAll('.mission-workspace select')[1], 'toolkit'); await radio('Wool wrap'); await click('Check material'); await addNote('Legacy Northwind: loose connector.'); await click('Complete checkpoint'); await click('Finish mission & return to map'); await reload(); assert.equal(state.missions.find((m) => m.id === 'glacier-relay').state, 'available');
});
async function packToolsForLegacy() { for (const id of state.selectedMission.supplyIds) { const card = await inventoryCard(id); const item = state.inventory.find((i) => i.id === id); if (!item.available) await click('Missing', card); if (!item.packed) await click('Not packed', card); await click('Close panel'); } }
await test('Earlier incomplete Base Camp save has achievable objectives and normal finish path', async () => {
  const save = legacySave(); save.selectedMissionId = 'base-camp'; save.missions[0] = { ...initialMissions[0], state: 'active' }; await mount(save); await open('base-camp'); await click('Review supplies'); await packRequired(); await click('Confirm supply review'); await genericMission('base-camp'); await click('Finish mission & return to map'); await reload(); assert.equal(state.missions[0].state, 'completed'); assert.equal(state.missions[1].state, 'completed', 'Older Cedar completion remains preserved');
});
await test('Per-mission partial saves resume independently and completed reentry cannot reverse progression', async () => {
  const save = legacySave(); save.missions[0] = { ...initialMissions[0], state: 'active', objectives: initialMissions[0].objectives.map((o, i) => ({ ...o, complete: i === 0 })) };
  save.missionRuns = { 'base-camp': { ...initialMissionRun, stage: 'objectives', started: true, objectiveIndex: 1, answers: { b2: '12' }, completedTasks: ['b1'] }, northwind: save.missionRun };
  await mount(save); await open('base-camp'); assert.equal(state.missionRun.objectiveIndex, 1); assert.equal(document.querySelector('.task-card input').value, '12'); await click('Save and return to map'); await open('northwind'); assert.equal(state.missionRun.stage, 'cache'); await click('Save and return to map'); await open('base-camp'); assert.equal(state.missionRun.objectiveIndex, 1); await reload();
  const finished = legacySave(); finished.missions.forEach((m) => { m.state = 'completed'; m.progress = 100; m.objectives.forEach((o) => o.complete = true); }); await mount(finished);
  const before = structuredClone(state.missions); const handler = state.finishSelectedMission; await act(async () => { handler(); handler(); handler(); }); assert.deepEqual(state.missions, before); await reload(); assert.deepEqual(state.missions, before);
});
await test('Partial and malformed saves fall back safely; locked entry and direct early completion are rejected', async () => {
  await mount({ tutorialCompleted: true }); const before = structuredClone(state.missions); await act(async () => { state.startMission('echo-canyon'); state.finishSelectedMission(); }); assert.deepEqual(state.missions, before); assert.equal(state.missionRun.open, false);
  await act(async () => { state.togglePacked('relay'); state.addNote('Clues', 'First'); state.addNote('Clues', 'Second'); }); assert.equal(state.inventory.find((i) => i.id === 'relay').packed, false); assert.equal(new Set(state.notes.map((n) => n.id)).size, state.notes.length);
  await act(async () => root.unmount()); root = null; localStorage.setItem(KEY, '{broken'); await mount(); assert.equal(state.selectedMission.id, 'base-camp'); await reload();
});
await test('Shared mission ledger, inventory CRUD, notebook CRUD, lab notes, and hints stay integrated', async () => {
  await mount({ tutorialCompleted: true }); await click('Missions'); await click([...document.querySelectorAll('button')].find((b) => b.querySelector('h2')?.textContent === 'Establish Base Camp')); assert.equal(state.activeView, 'Map');
  await click([...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Manage'))); await click('Add item'); await input(document.querySelector('input[placeholder="Item name"]'), 'Spare notebook'); await input(document.querySelector('input[aria-label="Quantity"]'), '2'); await click('Save item');
  let card = [...document.querySelectorAll('[role="dialog"] .rounded-md')].find((el) => el.querySelector('p')?.textContent.startsWith('Spare notebook')); await click('Available at home', card); assert.equal(button('Not packed', card).disabled, true); await click('Missing', card); await click('Not packed', card); await click('Packed', card); await click('Edit', card); await input(card.querySelector('input'), 'Updated notebook'); await click('Done', card); await click('Delete Updated notebook'); assert.ok(!state.inventory.some((i) => i.name === 'Updated notebook')); await click('Writing'); await click('All'); await click('In-game equipment'); await click('Physical supplies'); await click('Close panel');
  await click('Notebook'); await click('Add note'); await input(document.querySelector('input'), 'A test observation.'); await click('Save note'); const note = [...document.querySelectorAll('li')].find((el) => el.textContent.includes('A test observation.')); await click('Mark important', note); await click('Remove important marker', note); await click('Edit note', note); await input(note.querySelector('input'), 'Updated observation.'); await click('Save changes', note); await input(note.querySelector('select'), 'Numbers'); await click('Numbers'); await click('All missions'); await click('Mission notes on'); const moved = [...document.querySelectorAll('li')].find((el) => el.textContent.includes('Updated observation.')); await click('Delete note', moved); await click('Map'); await click('FIELD LAB, lab'); await click('Lab Notes'); await click('Open shared lab notes'); assert.equal(state.activeView, 'Notebook'); await click('Map'); await reload();
});
await test('Readiness check and progress/profile/parent buttons display real saved campaign data', async () => {
  await mount({ tutorialCompleted: true });
  await click([...document.querySelectorAll('footer button')].find((b) => b.querySelector('span')?.textContent === 'Diagnostic'));
  await input(document.querySelector('input[aria-label="Diagnostic area"]'), '7'); await click('Check readiness');
  assert.ok(!state.selectedMission.objectives.some((o) => o.complete));
  await input(document.querySelector('input[aria-label="Diagnostic area"]'), '12'); await click('Check readiness'); await click('Close panel');
  await reload(); assert.equal(state.missionRun.attempts['diagnostic-area'], 2);
  await click("Open player profile"); assert.match(document.querySelector('[role="dialog"]').textContent, /0 \/ 5 missions completed/); assert.doesNotMatch(document.querySelector('[role="dialog"]').textContent, /XP|Placeholder/); await click('Close panel');
  await click([...document.querySelectorAll('footer button')].find((b) => b.querySelector('span')?.textContent === 'Parent Dashboard')); assert.match(document.querySelector('[role="dialog"]').textContent, /Attempts recorded/); await click('Close panel');
  await click('Skills'); assert.match(document.body.textContent, /0\/17 expedition objectives practiced/);
});
if (root) await act(async () => root.unmount());

await test("Real installed failure: stale map labels and misassigned Base Camp evidence migrate without resetting progress",async()=>{
 const save={settings:{keep:'player preference'},learningRecords:[{id:'earned-record'}],schemaVersion:2,tutorialCompleted:true,selectedMissionId:'base-camp',missions:structuredClone(initialMissions),missionRuns:{northwind:{...initialMissionRun,completedTasks:['base-camp-site','base-camp-supplies'],answers:{'base-camp-site':'level-ground, high-ground'},attempts:{'base-camp-site':2}}},inventory:initialInventory,notes:[...initialNotes,{id:'player-note',category:'Clues',text:'Keep my observation.'}]};
 save.missions[0].nodeCode='Sample route';save.missions[1].state='available';save.missions[1].nodeCode='Sample route';save.missions[2].state='active';save.missions[2].nodeCode='Active mission';
 await mount(save);assert.equal(state.selectedMission.id,'base-camp');assert.equal(state.selectedMission.state,'active');assert.equal(state.selectedMission.objectives[0].complete,true);assert.equal(state.selectedMission.objectives[1].complete,false,'Supplies exercise does not waive area calculation');assert.equal(state.missions[1].state,'locked');assert.equal(state.missions[2].state,'locked');assert.ok(state.missionRun.completedTasks.includes('base-camp-supplies'));assert.equal(state.missionRun.attempts['base-camp-site'],2);assert.ok(state.notes.some(n=>n.id==='player-note'));
 assert.match(document.querySelector('aside').textContent,/Continue mission/);await reload();assertCampaignPresentation();assert.deepEqual(JSON.parse(localStorage.getItem(KEY)).settings,save.settings);assert.deepEqual(JSON.parse(localStorage.getItem(KEY)).learningRecords,save.learningRecords);
 await open('base-camp');await click('Review supplies');await packRequired();await click('Confirm supply review');await click('Begin mission route');assert.equal(button('Next objective').disabled,false);await click('Next objective');await input(document.querySelector('.task-card input[aria-label]'),'12');await click('Check answer');await click('Next objective');await click('Organize supplies');await click('Review mission');await click('Finish mission & return to map');assert.equal(state.missions[0].state,'completed');assert.equal(state.missions[1].state,'available');await reload();assertCampaignPresentation();
});
await test('Multiple active/paused saves have one current mission; switching and completed review preserve independent progress',async()=>{
 const save=legacySave();save.selectedMissionId='base-camp';save.missions[0]={...initialMissions[0],state:'active'};save.missionRuns={'base-camp':{...initialMissionRun,started:true},northwind:save.missionRun};
 await mount(save);assert.equal(state.missions.filter(m=>m.state==='active').length,1);assert.equal(state.missions[2].state,'available');const cache=structuredClone(JSON.parse(localStorage.getItem(KEY)).missionRuns.northwind);
 const start=state.startMission;await act(async()=>{start();start();start();});await click('Return to map');assert.match(document.querySelector('aside').textContent,/Continue mission/);await open('northwind');assert.equal(state.selectedMission.id,'northwind');assert.equal(state.missionRun.stage,'cache');await click('Save and return to map');await open('cedar-pass');assert.equal(state.selectedMission.state,'completed');assert.equal(state.missions.filter(m=>m.state==='active').length,0);await click('Return to map');await reload();assert.deepEqual(JSON.parse(localStorage.getItem(KEY)).missionRuns.northwind.completedTasks,cache.completedTasks);await open('northwind');assert.equal(state.missionRun.stage,'cache');assertCampaignPresentation();
});
