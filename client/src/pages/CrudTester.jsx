import { useState } from "react";
import {
  seedAll, wipeAll, getCounts,
  smokeTest, listUsers, listProfiles, listInvestments, listTaxes, listMortgages,
  createInvestment, updateInvestment, deleteInvestment
} from "../services/testCrudService";
import { Box, Button, Stack, Typography } from "@mui/material";

export default function CrudTester() {
  const [log, setLog] = useState([]);
  const push = (label, payload) =>
    setLog(prev => [{ ts: new Date().toISOString(), label, payload }, ...prev]);

  // existing tests
  const doSmoke = async () => push("smoketest", await smokeTest());
  const doLists = async () => {
    const users = await listUsers();
    push("users.list", users);
    const userId = users?.data?.[0]?._id;
    const [profiles, inv, taxes, mtgs] = await Promise.all([
      listProfiles(userId), listInvestments(userId), listTaxes(userId), listMortgages(userId)
    ]);
    push("profiles.list", profiles);
    push("investments.list", inv);
    push("taxes.list", taxes);
    push("mortgages.list", mtgs);
  };
  const doInvestmentCrud = async () => {
    const users = await listUsers();
    const userId = users?.data?.[0]?._id;
    const created = await createInvestment({ userId, title: "Test Fund", amount: 1234, category: "Test" });
    push("investment.create", created);
    const id = created?.data?._id;
    const updated = await updateInvestment(id, { amount: 5678, title: "Test Fund (upd)" });
    push("investment.update", updated);
    const del = await deleteInvestment(id);
    push("investment.delete", del);
  };

  // NEW: seed (add to DB), wipe (remove ALL), counts (see in DB)
  const doSeed = async () => push("seedAll", await seedAll());  // inserts one of each
  const doWipe = async () => push("wipeAll", await wipeAll());  // deletes ALL collections
  const doCounts = async () => push("counts", await getCounts()); // show counts per collection

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Mongo CRUD Tester</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={doSeed}>Add sample to DB</Button>
        <Button variant="outlined" color="error" onClick={doWipe}>Remove ALL</Button>
        <Button variant="outlined" onClick={doCounts}>See counts in DB</Button>

        {/* existing */}
        <Button variant="outlined" onClick={doLists}>List All</Button>
        <Button variant="outlined" onClick={doInvestmentCrud}>Investment CRUD</Button>
        <Button variant="text" onClick={doSmoke}>Run Smoke Test</Button>
      </Stack>

      <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 12, p: 2, bgcolor: '#111', color: '#eee', borderRadius: 1 }}>
        {log.map((item, i) => (
          <div key={i}>
            <strong>{item.ts} • {item.label}</strong>
            {"\n"}
            {JSON.stringify(item.payload, null, 2)}
            {"\n\n"}
          </div>
        ))}
      </Box>
    </Box>
  );
}
