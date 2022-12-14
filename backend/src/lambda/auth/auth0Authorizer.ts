import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-gm5710fngmn5xmkb.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  if(!authHeader) {
    throw new Error('No authentication header');
  }

  if(!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header');
  }

  const token = getToken(authHeader)
  const certificate = await getCertificate();

  if(!certificate) {
    throw new Error('Invalid certificate');
  }
                                  
  return verify(token, certificate, {algorithms: ['RS256']}) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCertificate(){
  try{
    const response = {"keys":[{"alg":"RS256","kty":"RSA","use":"sig","n":"xzkA--_4FR1fDU0esB7K1UVz1BNPQp9GrwT4qW9IPyP8bujztX9m6_OFDonNcLgZrKwocGXFND8MgHAx2tSjk8JrBAPviFDo21UuuEEvPm_pXhcxCGbbOhWTCngIvwP_S7C3v7uhHfFoy5BhivNA2KsooWLGUx51LU7hDLOTXwii4XmNQuYhhGky1EHFUhFyCR3jyb-Zic6zmXzp64Mz-ZpcKvTmgSX2aoUTsCv0ROHJuyMNjjTTH75v_r0ll67FUWwZpxq1Az2HwtJH9r_vmFjURo2zB_lhrEoE1oxn70MMQTXSOvQa80SbV6kJbl4zkg4kRbvoBICDNiJWb9QGvQ","e":"AQAB","kid":"wz9GV58G5cOdcVtjmkHWq","x5t":"hKz11PPT242JoOhm9avXrV8aWTk","x5c":["MIIDHTCCAgWgAwIBAgIJRV3X6csoUK0CMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNVBAMTIWRldi1nbTU3MTBmbmdtbjV4bWtiLnVzLmF1dGgwLmNvbTAeFw0yMjEyMDIwOTA0MjhaFw0zNjA4MTAwOTA0MjhaMCwxKjAoBgNVBAMTIWRldi1nbTU3MTBmbmdtbjV4bWtiLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMc5APvv+BUdXw1NHrAeytVFc9QTT0KfRq8E+KlvSD8j/G7o87V/ZuvzhQ6JzXC4GaysKHBlxTQ/DIBwMdrUo5PCawQD74hQ6NtVLrhBLz5v6V4XMQhm2zoVkwp4CL8D/0uwt7+7oR3xaMuQYYrzQNirKKFixlMedS1O4Qyzk18IouF5jULmIYRpMtRBxVIRcgkd48m/mYnOs5l86euDM/maXCr05oEl9mqFE7Ar9EThybsjDY400x++b/69JZeuxVFsGacatQM9h8LSR/a/75hY1EaNswf5YaxKBNaMZ+9DDEE10jr0GvNEm1epCW5eM5IOJEW76ASAgzYiVm/UBr0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU2h6fzmxW4piStS6kfCszvVedO0IwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQAKjWNbvDe8RiD3DOA0YWdWWePcbu22jw/NZB7aQB9JPNSapflaNGRfI2fL/z43uuLeDtvnTFsfRgnC8qmlyx4pY/5ghabmXdps6WIds0agTZvKMLXWtw2EKhhpQaLu4Iy7qXFb42gQCpzxB2HGNMlYNRKrLewcrFXrROk3/JHcH/YM5Eg59sYqD8/AAvsICuixFS99psgJFK2OAMVGZVBmNhALLPHtQp79KJGGR1x6J4rJ1wC2+gQD3xOpQu4gjrKp81od92MT09saMxZmZlTBlU9BNUcoqaMv+T/2WGGvugPsBfN/VfU3hzn7iG1d4SXcnYsZAuqdJqswJoVOM0sd"]},{"alg":"RS256","kty":"RSA","use":"sig","n":"rI9exc6p_rM5lZcS-hwYqNTkn_FlCRIljNj5vS0MgE5VmlNKcf-YI5RoGk_Jvg129hriLXmJmrfhE1mULtOlrhjQPgl3rxHSWsQ9JqnNo3CtFndBW8C05V9ohxZdh8D_JumfKlb88S9epX6q5NNq94ieEZH0iLv8d6tBurIReAcH_mAzATHf5QjTsLttDDHuppWWOn7ot7MSeH5RU-ishaT9fio7xmRUAnYdLxddztWtx9LnsJqFvCH9c3n9sGzP-GW8CT17QrDktk_Q9Qz6aoj5quwrQfZl2eKuKrnVR6oknu3d0dm49ytL1fNfCKZFoK1MSOSCzB2LAjB4RW8lOQ","e":"AQAB","kid":"TSmBOk4R_rBS-k-7SGEQ3","x5t":"1iH1nTF5KvLeKCCGqNc7_TCfWBk","x5c":["MIIDHTCCAgWgAwIBAgIJc5nYgchlpo2sMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNVBAMTIWRldi1nbTU3MTBmbmdtbjV4bWtiLnVzLmF1dGgwLmNvbTAeFw0yMjEyMDIwOTA0MjhaFw0zNjA4MTAwOTA0MjhaMCwxKjAoBgNVBAMTIWRldi1nbTU3MTBmbmdtbjV4bWtiLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKyPXsXOqf6zOZWXEvocGKjU5J/xZQkSJYzY+b0tDIBOVZpTSnH/mCOUaBpPyb4NdvYa4i15iZq34RNZlC7Tpa4Y0D4Jd68R0lrEPSapzaNwrRZ3QVvAtOVfaIcWXYfA/ybpnypW/PEvXqV+quTTaveInhGR9Ii7/HerQbqyEXgHB/5gMwEx3+UI07C7bQwx7qaVljp+6LezEnh+UVPorIWk/X4qO8ZkVAJ2HS8XXc7VrcfS57Cahbwh/XN5/bBsz/hlvAk9e0Kw5LZP0PUM+mqI+arsK0H2Zdniriq51UeqJJ7t3dHZuPcrS9XzXwimRaCtTEjkgswdiwIweEVvJTkCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQU12neuIkAldAOYANdFXcjlBoPByEwDgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCqawnFspbrYvO9TAB0kdCWiXna4HFlmeAU34P5RSA1iO3rkLzNgrzu6nwpNiA+44gN2OVkWerXXJM8z3dwWcbSbsYa2t1D1weiS/t0eI/3C+mvLI5mqqeS8u1XwUuzo9+tLSXEBY9qxk+8J27L8uSWmWVNT9SRzlugiup7Buzi78f/uKtWoxmQMbZbR8vsUpKGVyIZXPnR1dhs72EcPCwiX2BgVV4k6zfSdS363NJqET17VK8OhbyO85hfVyc1Nc9woMXZwP4g5iTIY1VybtZYfBwO5+7ZU/w/xtIPBGgSzgIg/XdBgMgsMR1AchAKfVXwNSu3Ozb95U0svv09SWIV"]}]}
    const key = response['keys'][0]['x5c'][0];
    const cert = `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;
    return cert
  }
  catch (error){
    logger.error('Getting certificate failed',error)
   }
}