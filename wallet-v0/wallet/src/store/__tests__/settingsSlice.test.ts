import { settingsSlice, initialState } from '../settingsSlice'
import type { SettingsState } from '../settingsSlice'

describe('settingsSlice', () => {
  describe('setRpc', () => {
    it('should set the RPC for the specified chain', () => {
      const state = settingsSlice.reducer(
        initialState,
        settingsSlice.actions.setRpc({ chainId: '1', rpc: 'https://example.com' }),
      )

      expect(state.env.rpc).toEqual({
        ['1']: 'https://example.com',
      })
    })

    it('should delete the RPC for the specified chain', () => {
      const initialState = {
        env: {
          rpc: {
            ['1']: 'https://example.com',
            ['5']: 'https://other-example.com',
          },
        },
      } as unknown as SettingsState

      const state = settingsSlice.reducer(initialState, settingsSlice.actions.setRpc({ chainId: '1', rpc: '' }))

      expect(state.env.rpc).toEqual({
        ['5']: 'https://other-example.com',
      })
    })
  })

  describe('setTenderly', () => {
    it('should set the Tenderly orgname, project name and access token', () => {
      const state = settingsSlice.reducer(
        undefined,
        settingsSlice.actions.setTenderly({ orgName: 'myorg', projectName: 'myproj', accessToken: 'test123' }),
      )

      expect(state.env.tenderly).toEqual({
        orgName: 'myorg',
        projectName: 'myproj',
        accessToken: 'test123',
      })
    })

    it('should delete the Tenderly URL and access token', () => {
      const initialState = {
        env: {
          tenderly: {
            orgName: '',
            projectName: '',
            accessToken: '',
          },
        },
      } as unknown as SettingsState

      const state = settingsSlice.reducer(
        initialState,
        settingsSlice.actions.setTenderly({ orgName: '', projectName: '', accessToken: '' }),
      )

      expect(state.env.tenderly).toEqual({
        orgName: '',
        projectName: '',
        accessToken: '',
      })
    })
  })
})
