import CheckWallet from '@/components/common/CheckWallet'
import { NoSpendingLimits } from '@/components/settings/SpendingLimits/NoSpendingLimits'
import { SpendingLimitsTable } from '@/components/settings/SpendingLimits/SpendingLimitsTable'
import { TxModalContext } from '@/components/tx-flow'
import { NewSpendingLimitFlow } from '@/components/tx-flow/flows'
import { useHasFeature } from '@/hooks/useChains'
import { useSettingsStore } from '@/state/settingsStore'
import { FEATURES } from '@/utils/chains'
import { Box, Button, Grid, Paper, Typography } from '@mui/material'
import { useContext } from 'react'

const SpendingLimits = () => {
  const { setTxFlow } = useContext(TxModalContext)
  const spendingLimits = useSettingsStore((state) => state.spendingLimits)
  const spendingLimitsLoading = useSettingsStore((state) => state.spendingLimitsLoading)
  const isEnabled = useHasFeature(FEATURES.SPENDING_LIMIT)

  return (
    <Paper sx={{ padding: 4 }}>
      <Grid container direction="row" justifyContent="space-between" spacing={3} mb={2}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Spending limits
          </Typography>
        </Grid>

        <Grid item xs>
          {isEnabled ? (
            <Box>
              <Typography>
                You can set rules for specific beneficiaries to access funds from this Safe Account without having to
                collect all signatures.
              </Typography>

              <CheckWallet>
                {(isOk) => (
                  <Button
                    onClick={() => setTxFlow(<NewSpendingLimitFlow />)}
                    sx={{ mt: 2 }}
                    variant="contained"
                    disabled={!isOk}
                  >
                    New spending limit
                  </Button>
                )}
              </CheckWallet>

              {!spendingLimits.length && !spendingLimitsLoading && <NoSpendingLimits />}
            </Box>
          ) : (
            <Typography>The spending limit module is not yet available on this chain.</Typography>
          )}
        </Grid>
      </Grid>
      <SpendingLimitsTable isLoading={spendingLimitsLoading} spendingLimits={spendingLimits} />
    </Paper>
  )
}

export default SpendingLimits
