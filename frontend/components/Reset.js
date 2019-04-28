import React, { useState } from 'react'
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import Form from './styles/Form'
import Error from './ErrorMessage'
import { CURRENT_USER_QUERY } from './User'

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`

export default function Reset(props) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <Mutation
      mutation={RESET_MUTATION}
      variables={{
        resetToken: props.resetToken,
        password,
        confirmPassword,
      }}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
    >
      {(reset, { error, loading }) => (
        <Form
          method="post"
          onSubmit={async e => {
            e.preventDefault()
            await reset()
            setPassword('')
            setConfirmPassword('')
          }}
        >
          <fieldset disabled={loading} aria-busy={loading}>
            <h2>Reset your password</h2>
            <Error error={error} />
            <label htmlFor="password">
              Password
              <input
                type="password"
                name="password"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
            <label htmlFor="confirmPassword">
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                placeholder="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </label>

            <button type="submit">Reset your password</button>
          </fieldset>
        </Form>
      )}
    </Mutation>
  )
}
