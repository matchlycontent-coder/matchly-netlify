import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GOAL_TYPES, AWAY_TYPES, RED_REASONS, H1_F1, H1_F2, H1_F3, H2_F1, H2_F2, H2_F3, ALG_BEELD, BIJZ, MOTM_REDENEN } from './constants/options';
import { THEMES } from './constants/themes';
import { LAYOUT_REGISTRY } from './constants/layouts';
import { IG_ICON, FB_ICON } from './constants/icons';
import { WEATHER, M, U, T, hex } from './constants/colors';
import { usePersistedState, clearAllMatchlyStorage } from './hooks/usePersistedState';
import { safeGet } from './utils/storage';
import { PlayerSelect, Chip, AutoMinRow, MinRow, Sheet, ConfirmSheet, GoalSheet, CardSheet, SubSheet, MomentSheet, MatchHeader, formatMinuut, TimelineRow, GCard, SHead, INP, Empty, PBtn, BackBtn, ClubCard } from './components';
import { getLogoFromSupabase, saveLogoToSupabase } from './supabaseLogos';

// Matchly-logo (base64)
const MATCHLY_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAYAAABxlTA0AAAiF0lEQVR42u2ceZhdVZX2f3vvc+5UU6qSyjyHQEImCBCZNWALKiCjKIKfggOKDNqgSKvg1NofjdqNqNDYzfM0KDKI2MytgAxhDkOAkBGSkKFSqXm6956z9/r+OOcOVam5Ytt+3ed5btUdztlnn3evvfZa71p7KWutKBSCMNJDwSiu+p91aGBU4PL/Gbjqzwnw/7RD/RcKi/5rkIJ9ffxXzjz919rxvyod/JeWFBnoS9mHN5K/jDR4+0ItCOAcuLjTRoNWoNTw2xiNvpHCaWqQ3wqf1d7tF74SAREBF/+kiB5gX6hNa+2YxtI60BqMVmWPJCCCdcMAp49AqbFMF7V3G33v0+tG8Y9KK1QfaXDWIU5QWo1pcRk1wNaBZ0ApDQhr3g548o0cqzcHbGqwNHVYAhv1TMXTXccvH8EAWgQtYAAjghHBQ/BEMAKeEzyIP5feF79zghGHJ2DEYeIp6YkrnqPjNgtta8DEn7VI9N5AptpQMy1F/cJKJh1SQ+2CyghocYiNgd6XAA/mRFgHvqfJBY5fPd7DzY/08NzGPLbTRlpdq3iKxSIiEuvUCDhflQFUAMKBLy4GOALXR/Ac+CL4SvAl+i36H13vi8OPgfJF8AU8HH4MtBEptmWIBsGPB9eIQ4vDOIexAqHFAKkqQ/2SauafPpVZJ09C+xobWJRRf14JloKONZoHX8py5S0dvLY+AAMqDQlPoWI8nQNx0UAVJTWWPj+WWB0D5QG6II0ofHFoJ/hOSBSkMgapAJwvJck2YqPvUPhCDLLEUl0alCKgxL+Xn6PAU1E/CSzSE6ICy4TFNSy9fD4TjxmPK+g89WcAWCRS/lorrrylnX+4sxs0eGmFVhBYQXochBJ1wMSrhZOiBCvAd7H0FdVCYdrHYMW/e05IICQKUi8RuNH/gpRHEhp9dkUgCwMYSbKKB8LhFQAuv198rbGCtoJvFMmMJuFHgmE7A7QTDrhwLgu+Mh/nXD+KfeBZPyyA49mNVopzf9TCrx/KYsZplIEwFOiyeBWKo/ZP8N7FCZbM8qmv1vhe3JeyOygRFBH7UWhcxWMRnScoiTSNike2sKirwrmFl4BCen/X97qyh1fx4lu+HCsRJHDkW0NaN3Sy58UWWl5uw3WFpKs9PKPQ1pJvyjL7YzNZ+sOliAxfkvsFWPVZcAs694KftvCv9/bgj9c4B7bHojR89m8yfOmkCpbM9vu5ejCN/t/T92tZ28HG27ax7bfv4gkk0gajhXxDD3M/PZeF31mEDe2wFr5BJVgBYQzuDQ908aV/asMfZ3CA7bLMnaT418tqee+SFCCEVnBOYpMnmkf9TpshTLbhGHaldqW3zVX8KyM384hMNm0iuW9YtYdXr3qDYHuWZJWHxhHu6WHxdQcz9awZe4E8YhXhJLJv32mwLPlyMz15h/YUYZdj8RzDQ9fUMW28Rz6waB2pkJEcTogGhEi3q30k0AoQJ9ENosZHNFmia8EkDN07enjhghfp2dhJssqDICCRNhxy73tJTk4iVgb1h/WgnRRQSvHdu7roanV4vsLmhCkTNPdfXce08YZ8YCM9NVJwneAZTcI3+L7BGBV5U/vCRXeC8gw64aF8D4wqmUDDGSCtUJ7C5i2ZqWkO/ZdDSI73cT0hXsIQ7s6y4+ZNKDV0n/Vg0uV7iq2NIbc/nUdlwDpBQsdNX6ph5gSPfBCtuiOWLgHPM2zZmeWmO7bxb/e8S0NTHmMMY8ZYInDtuka6bn6e7D2vo3IWZQwjbTwCOaRieoYDv70I12NRoWAqDI33byO/J4f29aDayBvMUzNG8fvnc/S0WpLjFLk2y4ePTnLSoSmC0OGZkXMm1gmeZ/jPZ5o4+/I1tDRlAWHa9Aruu345yxZUYK1Dj8ZziiW35/ZX6LjoXqQ7BHF0Hz2L2ts/gapLRxI3gtmmPI0LLZNOmEL9yom0/qmBVK1PsKuH1icamHj6TJxzezkhBX08sIqIbB3+sCaP0kTGkIZLPlgx6ggIsa7N5R1fum4zLW0BiQlpkvUZtr+b5cs/Xjd640IEjMY1dtFx5UMQOkxdBl1fSf6Pm+i6fhVK6xIjNcKmAaadMxPEoZSgldDx7J4hyTs90K9ebOOu3W6RhCKfd0yfajh6YQJEGJ2ACVprGvZkeWdXFl0dzYQgdJhqj3XbuujJRjp9xGMYrxd2cxO0ZNGZBAQWFTp0TYrg1e1Rk6NYSZWOYpbj3lNHZnpFpCp8TXZDW6TvB1GTekCDSEFLp6OxzUWKJCccPNsjk1JYO6p+opTCOUd9XZKp9Slcd45E0pDwNbYzYM6UFKmkwdpRSHF8vp45DlXtQ86iEgaV8JD2HP6Bk6JTRiHBKJDQ4VcnyMyvxGUtxlcEzVlsVxCZagPodz1Yq9kAcmHM21hh5ngDqFH1sYCBdUI6ZfjRxbNI+YZcY5ZsYw/jan2uvWR+JC2jWemUQsIQM6Waim8ch+3OEu7uwL7bQmLFDNIXHxWZX6NkxQpdSk7PINZFoOYsknPl/uPICHeRsoERoTKlhjD6hz6MVoSh5bTjJvLCrzM8+GQDvu/x4WPrmT8zM/oFLlLwSGjJfP4IvIOnEjyxGVWXIX3aElRtGrFuzES6V+lFi6kqWEQyvIjG4CBFI1Tqmxp19CUy0aKJs3i/Sg6cU4FWEjkDcWsiqvQAo7AiFJBYMQv/kBloo0ttCGP2zlV5pGYYBok3GEhqgGkyVPho0IXeaDq7Lf982zbufHQ3m3d242nNkllpLvr4LM76wESsdcM2p4r3tA7te9imbtp//BT2kY1IcxcqafBXzCB90RH4h05HQjukFA/6HAI6pgDUMIZ/GDG5mCxHhnxeGcItNlqxbWeWUy57nVdeboGMith3CfnTC1n+tKqFi86bw0+/MR8Rh7WC0YM/hhAtQCbhkVu3h53n3AFrGkhV+igVh65+8xr5e9dS9U+nkDzvoCFBlkFA1iqOKcjwArN6SMBcbzUxlqkVBMKZf7eeV9a0k5iUQqd9lDEoYzBVCUxdihtu2cJ5l7xBPq/wPI0dYkUtgNu9eiebT7qV3MZmzOQqVMpD+x7G9zDjMijP0HHR7wif2YLyDIMGDAcjqKQ0lYcjwXrou0hptRul9RBJoubuR/fw/HPNJCYkCUJBYjZX0FinsA7S9Ul+c992zr1gNW1tFs8zOCv9Z+PE4LY9tY31p/0G15zDVKeQvEW5AgAC1oKnEevo/tGT5Z7U6FzxstfYAFajXMkGOB54phVlVCQAKqbKozBJHDxV2ECYOD7Jk0838ulznqVhRxbPN9g+IBfAbXxkM2989G5cT4jO+CUGrYxchyiyotMJwld34pq6IimW0dnEFMViaNj0yNqWUdHlBWFpbAsRrUsxCBU5H0qBjr0hpRRhKNTV+qx9o5Uvnv0UWzZ04PmGMJ7WYgWT8Nh29zpWn3Nv5E0lPZyVePDiPAiJVJyS6CVa4boDXHt2xEIjZRio4nqkBg1UDBNgVQqvjNY8U6qPHpMSHR9TfrYrjDjhWB2FIVTXJNixtZMrznqM9S+34PseLnAY37D+1jd57jMPoX0P5ZsojyF2a8mHSC4EUxAJVSTnBWEslJ0q42mUkiHxGBJgVdC9bmwdG8g1Eiukk4ojl1fhOkO0UhgVDWUYCJlKn/bWPN86/WHeeGIXXtLjxV+8xqOffwSvKgG+jnlrHTFfnTn0jGoSyybhcgF4ure+3QfPoERQTlDixqiDy5T6PgFTVMlSV2UPLor/uG4JX/vsTLqb88W0CqUgl7NoH6on+Fx33sPcfO7DPHLNk9QvHk8+m8e5yDERE/EZ3sRKJv32XBLH74d05COdr+KpXVz9R6l66Se4OsR89oanIqTPaIzUJSqXINW7uyriNjqzjh9eMpfahOZ7126gqlKjlJDOwAkfmsMxJ0zm1QffYd3v13Pat49k/MxKdt7xFj1/3IIoRdieJTO9kml3nIU/p5aelixKx9JdtIBUUS2NXljiDCUE1SvhTY0O4MhlHat/OXjYU+vIp3cifO3C2Uyp9bn6m2/gOcu0hdV85FPzmXVANctXTmX9mXPYf8VUwlyIj2btc7sId7ZTNW8cc+84k+Tc2jhkpHut+qLAxbF+GR2uxXdKHAozLFT0cFoeu4oo0ZWUv8pSHJWK4nq5vOWTZ0/j59cvQ2vF22+1UTsxEdGnDd28/WpEcntJD0JH69o9VCyeyMJ7ziY5txbbky+jD8uTXqQkySJjUBFSSrbrJTgjVhG9E0N66+JRkrUyCPlc6JCBILCceMIkKm86lAfveJv1rzTR3Z7jvp+9yo7VO2he28xhJ88h6Moz+5NLWfL9Y0lOr8IGYUlyUUXzrKDkVL+20Mg5bR23qGOTbZRchCr63oVJpUaru1SZ+i08pmIAj0phDISh5ej3TeTo901ERPjB5x9nzartzJtRwR9vfIkDjpzM8o8tgo8tQiDKUTA6SuQot6eUQnQZu6DHqIMpZROxb6yI/uR1hA5H+ZRUqjTusfcm/bSrY944lw1QSrF85RTyWUvrrk4qa1PMOXwq4oQwHyK2nyybAqYx4SMxaaWcjM0rFQc4lLhheWnecISvoGoUA/PBw+FuVXmGtNIDGEG9QVa+wTnHMSfNpfE7R7DrzV2sPG0h46ZW4cShPd3/8BdmnpMykmbs5rtSkSWih6kohwcwfe1HGRXpXjKDNQpXnB6qLMYZUUBqLze7osrnvKtWlOhP5wZUWaoYjlG9DBmRklUxJpu+YEWI7AuApShYozUmCkI0ZUICcQatI4JLawM2pLrCML7GQ8QNuARZK4hzxcHVQyS8qClVUYd9jYRhFLJHIOWj6jID6b7hucr9DOBAjemB7QehZJorxmKf61hqvnDqREg68p0haI0NQ2xzwIUfmUxlxiMMByb1C4SQNnpwcOMUrOQZi1DTKrANnaAVYh22sZ3Ux5ehx2WQwI3ugYrW1PDMND3woq96u4ajtB8LutRaYcWiCu76wTwOmJHEswHjKzyuuGgG3/z0dKx1GKP2hZJErMObWUvVbR/DWz4JkRDSmvRXjiHzjePj4CejWqhVOaM2tpBRyUAvrvXCgJZkIbo6sCknBKHljJUTOOmoWt7e1s34uhT1tX4pa3yMh3MuHlCNWEvyyDkknrqIcF0jZlwaNaUaG4aRBaD1yNaQspCGipPE1TD6PDQXEXtyhWzy/hY5pVSxw9bavUAWEYwxGCAMHQlfsWBeVRF0M9hWqRHQHp7n9QK7EHvzF04q5onp+JzCYIzUmI8VJnqYJJg3sA5WZTqnkPrf/2gHQUBPTw8J3yedyfTqfAHcjo4ORISKigqcqMh2VSreXzdQqMlijBdvrJEhzafNm9+mp6eHWbNmUlGRKZLuLgjRWrO7uYnX17xO3fjxLFu6ZJQJLpEHhxpDTE715WnivC/pY8/a0KK15j/+40H2X7Ccgw49hrVr16G1xjkXA2S4/Y67mX/Awaw4fCVbt27DFFZ0FUtakc6UXg/t+z7gCIKgX5Uk0tu0Oee8C1i8+FBeeullQBFaiyA4BGU0f3piFccffxxfufyqYhpXfyD3D7yUTCIRhqsj9FCTQiuKfrdWfWQ4/tjV3c3uXQ2sf2sDX73yW5E1G0tuc3MzV3792+xubOLdHTsJwzDqp7WoeFobEzkTWmu01nHYKOSbV3+Pw496P9u37ywOWuFljInyiRFs0XzTMQbRNoZEIlG8DqK0Aa0TpJKp6LMxkWrrA6gxBq10/ypClbamjVqCZa84FMVQTv90o0ZpQ/3kidx334Pccec9+L6P1prvfP9atryzhZpxNfiej45DRIlkEqUU27Zto7W1Fc/zCMOAfC4HQFtbG9ff8C+89PIawjDAWouI4HkenufR0NDA9u3bMcbD96LtTIV1oKqqCmstW955B+ccyWSyTDdHUh0EIT09PThn0cb0UjW5bJZsLtsvKFqpSEUU16UxqYjY1ZSyDdOUVUgpy0kSceRzebxEgiuvuoZ8Ps/LL7/Kjb+4mXRFhiAfIDjC2AO7/4GHec+Rx3PQIcewaOnhXH7F13nf8Sdx3N+czEMPP8KxKz+E1oqa6iref+KpnHX2J/F9nzWvv8HJp5zF0oOPYtkhx7DyuA/x5FNR7m8Q5EmkK7jjzrs56JCjWb7ivaw4fCWPPfaneNZEPEIymWDr1i0cfOgxHHXsiezZs6e4UH/+i5ey/4JFPPjQI2itsdb29g6cixyemJMYoxWhirkFuj/zrIzLRfLMmT0DpQ0vv7iKb179Pd5at5FsdzvHvG8lGza+TXtbGzXVVTz/wkucevonCHPd1E+ZRj4IuO4ff4zyK5g8aTydnV1s2boNY3yMVmx9Zwvz5s7hnXe2cMIHT2fnuxsZN2E6iUSCxx97kPce9yxrXn6KdDqNdcK1//hTpk6djNYeq198nk995iI2rF2Nn4i2mWV7ssydO5cpkyfzp8ce4J7f3cdnLvg/bNq0mVtvvYNEIsHh71lRlNjeIWMX6+DhWTfDjCqr/o3xXrZvwOTJk/jut6/CT47j+htu4v77H2LWvAP4ztVXEQZhcdPIj35yA2GuhVPPOI2Xnn+MN197josuvhiNQynNisMO5ZUXn6CmphprLY/98T7uvP0WfvSTG9j57gZO/PCpvPjc47zy4pNc+MXL+M7VX2fa1KlY67C5di679AtseGs1jzx4NzNnz+PdrVtZt249mUzkIoexBfOFC88H5XPbr+9EKcUDD/0nPZ0NfPSsjzBlymSCIIhd7N7LjibKT9MyNMU1rJARA3otqldTTc2tfPhDJ3L66Sdz1933YsOQb151OYsXL6Kzq4tUKklTUwsbNm5GmQzf+PrlzJg+HYBrvvU1fv2bu8jmcmQyaaZPnxbbx4q5c+cyfvx4Xn3tdZTyueJvL2be3Dk45/j5DT/u42h4nHXmqWQyGQ4++CCWLF3M1nfW0t3TU7TPvVjnfuiDH2D+AUt5+qknef31N/jPPzwO+Jz90TMGAiL+H2/GduwjK2KIgZKyPjjn+OHfX4MxHssPPYjzP30ezc0teMbEi5TBMwaF0NzSUmyjtbWNfC6PVgprLdlsNnJ7nSOR8AFIJBIoJezZ01xcXNvb2/sArMnngyjGV2aPl28zKwBdVVXFJz5+BmE+y5V/dw2rVj3DgkUHcfRRRxStoL1ma7yJPXIyxqyDS+SqVgMnoGil8TyD7/s4Z5k9exbf/fbXOfDABdG+CWvxfB8Rx/jxdRx91BE8/8yjXPn1a8hmI4n97vevJZ/PU11dWfTKIpAsv/r1Xbz//e/juPcdwx8e/j3XfOeHaK2pqqrkmm//gMrKCm6+6XoymTSep+JNjdHLGIPn+cXPnucVrQ1BOPfcj3HdT37Go489RU9HB1+88DMkk0ny+Xwvz7D8kUthezU2gKVIy/Vl9yRmJ6JRzWazhGGWltZWjDZYa/nqFV/uNbta9+wBhK6ubr56xSXcd/9DrH7xaU45+VQgAK8agIaGRrLZHMlkkhWHLefuO27lb79yMQcuPpTnn32cR/7wGI//8QHOOvPMeAIGLFx8GJ7n0dzcQhh2ks/ne82MMMwThCG5XI4wDGhr74g80HzAnNmzOO0jH+JXv7qLqtpxnHXmqcXZMRAqUszFGjxlXYYCOI7KoXD9ZmEVjPSlSxZxySVfZs7ceXEMU2HDEImN9traWq742mUYY8hkMkycWM/jf7yP63/6c15d8ybjxtVw3ic+yosvvUJ3Vzc1NdWICD//6Y9YfOACNm7cxJKlS6ioqOD+39/JjTf9kiefepYwzHPkEYdz0Rc/S1VVFZ8892y2HXsks2fNRCSiPs/5+OksX3YA06ZOpXbcOC699FIOXLSsaFNrrTnyiMP591tu5vDjjmHx4kVYawcBuFQnqJwAGzCoZq2Vvq8wtCLiZOuuQKZ/ZLtMO2mb1Bzztvzg5mYREcnne59ffvTXXt8jDEMZ6ujvOjvIdX3bHOje5b83NDTIL276V5m/8BABT27/zV3x8+X3fo58ICIiLd9/TrbV/0x2zrtJGpf8UsLdneLivvX37EPqYB0napQTXtKH4rLWFlm0XgtDYfGxljA22LWKfg9cGHPAundaRyxZ5e0WdjYZrQnj6zyji4uqMQalFEEQFBeniDsRsvlctK/PxMF2Fy1+qVSKVc88z4WfOx9IcP5nL+TMM04lDMN+nwEpJ9zdsIMhw1jkpFfRi/7s4cLiMZit5xXcWaPLyByKpFF/tRcKAxYR8WVT1gcRh3OlDTUFDqEUpnJ4xsMkeoMV2ohZExHmzZvDly6+jGOPPZYzzzi1X5JHlQVRey9BAgwdofaGMiEK5IYaTb5J32isVrz2TBNbNnaTy1pqaxIsPKSaqfMqsdb1iuComLgyxtCTs9zzRANrNnUBsGJhJaccPQFjokhJX46/AO62rh08uutpsiqHJ4bltYs5uG5JxEeIsGTxIq7/5x/3JuvV4BROIUOoyEOoMQGsigM16i0E8TVhKDx+01t402o47AOTSKUUrXsCXrhvB/MW1LD4hPpekuziqb55R5YL/mEDr6xvIwxCEr7ixt8pVi6v48avHkBddRwsVaoXuI82rOKp3c9x4pSVTEpPoCXXxpN7nuXVtjf51Jyzsc72UW19czT6pCRILzuijMsdtaMhRapSxe9z+ZGnTkms/9b/+2vst6ya9yxJ0vHUZpqf24m8uZOTLphNy4YWdqxuwngGcVKsU5HNWb5w3UZe39RBbZXH+SdN483bDud7n5vHb5/Yw1W/eDsGVpXIfW3Y0PE2T+95gb9bdCkzK6Yyq2I6B9Ut4uL9LyAg5A+7n8ToiOos0KWDPVOv0GbOxo5XvEd5CIkf1JNLJSHlK8SBUYrde+zI8BXBeIbcjmZqwhZmHlzLtntfo7IugV27iZ5tHay/7XUO++RMdj3+bplqiDaNP7q6jRfWtlM/zmdXU46Lz5zGU2s6+dnvdjJ/Rpr7n2ngtY0dGKOjPGEiSf5DwxOcP/ujrG5bw4efOI+uoJu8zRO4gPNmnMHq5tew4kZWRCQGUnZ3oQ1RXkfag5QZlBfWA/EPIlBTqRlf4xGEQjIBm7bmCUNh2PtH4pPsjp3UHZAh7MlRP7WDypZtTNh/InU0UZEISVWnyJAn6MqjPF1s+413etBGk81bLj59GhNrE9RWGvabmiIIhdAp1m7pLt5KxSR51uWZlKonJQmmVE2iws+QMAl87ZMyKTJemvZ8e2zRDFPveQoJHeHGVlTCQODQdWl0RSLaAz2SvIjIRALPaPafYcjlhExSsfGdPOs25yNdNRyE44wdLx2gTRdeIiRZ2YWpciTCXaSnVFNJLiLgbZa+zGBVJnJknCgWzK4kldAsmJVmxuQ0+TCKUFSmTelecZ985bEr28iSuoUcW/Mernjlu9y0+Vbu3HIfKOjJ50iZ5F7m5mCZMwpNuKEFu6kVlfYgF+LtVxtJo3UDNqOHED6OXJrEuig42d3juOfhzph2HF4kVkTwZs5A5TeBn8avacabopDsbhLVIV4iS35PDxlt8TIJJCxZE8csqSbpKZK+4vKfbWZnU44b7tnFvz3QQEVKM67K59CF1XH9itIT7lc5h1c73gTgqwdexEG1i/jV2/fSZjt4veUtKhOVpL001tlhL9RKQfZ3G5D2LMoolLV4h08dMuY/YERDx9Xd/+aIDPU1mlzOUV2p+e2DHWzbEeD7kd4bjMCMPAGLqhqPnlQLu57FLDsNRZbk4vmIEipPOYL2Xz5OzQf3L0qg1orQOhbNreDzH5nCjj15MslokCvSBs+D5o6Ar5w9g8l1CcI+Jp7Rmo58F5s7t5CXPJ+YdTqPH38nR004jN+8ez9nzzh50Ny2vaTX04QNXfTc9iamKoHKhuhJFfjvnRXNgn4SZtRQYXulohyGmZM9TjwqzR33tzO1TtPRFvK9nzRy4/+dWqb7BhNijTiLWXQ67s1fw/ZGzIyjQHxUspWOf/sdFUcsI33gVFzZHmKtwFrHNz81k+oKw4337sA5IQgcE6p9rjl/Jud+YFKv8gcF82lz91a2dO2gLd9Oe9hBwiTIBjkSJsml+59PXXIc1tmh2bCyiHr71U/jGrrwJqSQ3R0kzliCnlyJBGFUMHkgCnfQumlxYaT1WwJO/tx2khpSBtqaAz53Ti2XX1wfR3llWDUelNa4PWtxuzfgWroR6vH2X4ZXP6EXuHunXmma2vJUpAyNbQFVacO4Kn8v56RwZG2OjJcGBd1BN435ZqpMBXWp2mhnrQwD3Hh2as/Q9k8v0Pm9Vfi1aXRoUdpR88g5mDnjhqxBMWTtyoI7+pNbWrj2F01MG2/Q1tHVGnLuWbVcftnEOCM9ilUprfr3cAoJc8brHeKK/NeBOylRlRTf172mSxC6AZNWNBqHw4rF137R3w1dGAXAlBqImy1VwfajTS5t//g8ndc+h1fpYzwNuzupuOZo0peuwAV2QPVQlGBnrQxV4yG6t+L8y3ew6rluJtcajBM6WwMOOyjDRV+oZ8mydK95NWBmkrjePrzSw8pyFOmbrjX4uYWM0MKu0sHz5qIGVVlQIXiribYfPkfu/k2YmgTaU9DYSeqEuVT9+ymlehZDdH141VclWnha2hwXXLadDeuyTIxB7mkPSGk48ogqVr6/igWL0tTVG5LJsdTfV/1kZgwjZDWEFzZYC5J3uMYegjWN9DywmZ4HN0NHPlrUtEBTF4lDJ1Nz+2mo6sSw6/8MqwK2KuhjT9HU7Pjbq3aw+qUuJtYYEhpU6Mh3hWgHtVWaCeMNVRmFp1WxzLeJq1d7lKpPGygWSdbFWr5RvWCNQxMVby78ruMMI0+Bcg4VV7T2Cr/F5cYMgnJRrWCtJP4s0edCllKReXBo51BdeaSxG2nqjs6t8DEJjQodNLaTXDmLql+ehB6f7regx4D1ZUdSATvSx4p8XvjnGxq5564WtBXGVWhSXlTFmryDQFDWlSpUu+h9oqxYclQwOa7HjovLgbti3fZiZeq4gHKhcrWJ67NHYLm4XntpUApFl7VYtHNRVesCqHFx5sK1SiQaSBGMBpPQaF+jtUKCANWexSjIXLCUim8djUp6wypJM2qAS+oicktXr+7m1lsaeX11Fy4rZHxI+ZAyCl8TV7OOgSxUsi6W9o6Bp1AB25VJcKmovekFWqkkeJSb4KIq2JRAN7E0R0DaMomNQDWO4nsVg138Hzp0PoBsgE5okkdOpfKyw0geNQMnDuzIy4INWKB5yIWvWD1KWPNaN6sebWftK100bc8TdFkIYmmUuPh9oV67CEZRlGpT9r2HFKXZi+uwe5SkrlhzPZa86NqSpBslaFc4N3ppib8Xi3EFVeOKaiIC2GI8han28WdUkDxsCukP70fi8GnR84Z2WAvaPpHgvipDKWIuNSKtm3YHtOwJyXba4jaGYkSkT0lwXYyYUMoap3dpcF3c9CfFwsuquIBLWdlxKeZvFNK9ivdUUixfjkgvrFScBmWqfMzkCsyUyijiAYi1kdk2mgqzIwV4MKmOskcl2qSix1Y86S91FENuzsXkjRpb+a99IcGDqY9ighz91HUsZ81k7PXi+lo8Q5U0H7ARBfusDPewg54jlOxSZTw17EfcF4+k9nF7++rQ+2pq/e/xZwKY/6aS81cNsBqFy/q/AP8ZVuT/aYfaVwD/r94dPi7/D6ExEtX91mSlAAAAAElFTkSuQmCC";

// html2canvas shim — keep original loadH2C() calls working

const loadH2C = () => new Promise(res => {
  if (window.html2canvas) return res(window.html2canvas);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  s.onload = () => res(window.html2canvas);
  document.head.appendChild(s);
});

export default function App({ boot }) {

  // ── Club settings (PERSISTED) ──
  const [clubName,setClubName]   = usePersistedState("clubName", "VV Ons Dorp");
  const [team,setTeam]           = usePersistedState("team", "Heren 1");
  const [teamLocked,setTeamLocked] = useState(false);
  const [comp,setComp]           = usePersistedState("comp", "3e Klasse KNVB");
  const [stijlByTeam,setStijlByTeam] = usePersistedState("stijlByTeam", {});
  const stijl    = stijlByTeam[team] || safeGet("stijl","") || "Zakelijk & Nuchter"; // per team; valt terug op oude globale waarde voor backward-compat
  const setStijl = (v) => setStijlByTeam(prev => ({...prev, [team]: v}));
  const [C,setC]                 = usePersistedState("C", "#a855f7"); // Matchly-paars als default
  const [sec,setSec]             = usePersistedState("sec", "#ec4899"); // Matchly-magenta als secundair
  const [logo,setLogo]           = usePersistedState("logo", null);
  const [sponsors,setSponsors]   = usePersistedState("sponsors", []); // hoofdsponsoren (club-laag)
  // teamSponsors: array van { name, url } — meerdere mogelijk, roteren in 1 slot op de balk
  // Migratie: oude teamSponsor (object) → array
  const [teamSponsors,setTeamSponsors] = usePersistedState("teamSponsors", (()=>{
    try {
      const old = localStorage.getItem("matchly:teamSponsor");
      if (old) {
        const parsed = JSON.parse(old);
        if (parsed && parsed.name) return [parsed];
      }
    } catch {}
    return [];
  })());
  const [motmSponsor,setMotmSponsor] = usePersistedState("motmSponsor", { name:"", url:null });
  const [silverSponsors,setSilverSponsors] = usePersistedState("silverSponsors", []); // zilver-laag (max 4, op beide stories)
  const [squad,setSquad]         = usePersistedState("squad", []);
  const [baseSquad,setBaseSquad] = usePersistedState("baseSquad", []);
  const toggleBase = (name) => setBaseSquad(prev => prev.includes(name) ? prev.filter(n=>n!==name) : [...prev,name]);
  // Sorteer squad zodat basis-spelers bovenaan staan
  // ─────────────────────────────────────────────────────────────
  const [igHandle,setIgHandle]   = usePersistedState("igHandle", "");
  const [fbHandle,setFbHandle]   = usePersistedState("fbHandle", "");
  const [nextGame,setNextGame]   = usePersistedState("nextGame", "");
  const [sponsorSpeed,setSponsorSpeed] = usePersistedState("sponsorSpeed", 3500);
  const [aiConsent,setAiConsent] = usePersistedState("aiConsent", true);
  // HollandseVelden (PERSISTED)
  const [hvLogoUrl,setHvLogoUrl] = usePersistedState("hvLogoUrl", "");
  // Next Match fetcher state
  const [nextMatchLoading,setNextMatchLoading] = useState(false);
  const [editingMatch,setEditingMatch] = useState(false);

  const [matchDate,setMatchDate] = usePersistedState("matchDate","");
  const [nextMatchMsg,setNextMatchMsg] = useState("");
  const [hvLogoLoading,setHvLogoLoading] = useState(false);
  const [hvLogoMsg,setHvLogoMsg] = useState("");
  const [hvCompUrl,setHvCompUrl] = usePersistedState("hvCompUrl", "");
  // voetbal.nl (PERSISTED)
  const [clubCode,setClubCode]   = usePersistedState("clubCode", "");
  const [teamId,setTeamId]       = usePersistedState("teamId", "");
  const [teamIdLoading,setTeamIdLoading] = useState(false);
  const [teamIdMsg,setTeamIdMsg] = useState("");
  const [showTeamIdInfo,setShowTeamIdInfo] = useState(false);

  // ── DISTRIBUTIE & COMMUNICATIE (PERSISTED) ──
  // SoMe-beheerder (handover-flow)
  const [someName,setSomeName]       = usePersistedState("someName", "");
  const [someNumber,setSomeNumber]   = usePersistedState("someNumber", "");      // E.164 zonder + (bv. 31612345678)
  const [someCountry,setSomeCountry] = usePersistedState("someCountry", "31");   // landcode default NL
  const [someEmail,setSomeEmail]     = usePersistedState("someEmail", "");       // e-mail beheerder (Resend-verzending)
  const [mailStatus,setMailStatus]   = useState(null);                           // null | "sending" | "ok" | "error:<msg>"
  // Clubwebsite (voor verslag-export en deelteksten)
  const [clubWebsite,setClubWebsite] = usePersistedState("clubWebsite", "");
  // Meta-koppeling voorbereiding (placeholders — nog niet actief)
  const [metaConnected,setMetaConnected] = usePersistedState("metaConnected", false);
  const [metaPageName,setMetaPageName]   = usePersistedState("metaPageName", "");
  const [metaIgHandle,setMetaIgHandle]   = usePersistedState("metaIgHandle", "");
  // UI feedback voor distributie-scherm
  const [copiedDistr,setCopiedDistr] = useState(null);
  // Player import
  const [importMode,setImportMode] = useState("");
  const [pasteText,setPasteText]  = useState("");
  const [newP,setNewP]           = useState("");
  // Refs
  const csvRef     = useRef(null);
  const logoRef    = useRef(null);
  const sponsorRef = useRef(null);
  const sponsorScanRef = useRef(null);
  const motmSponsorRef = useRef(null);
  const teamSponsorRef = useRef(null);
  const silverSponsorRef = useRef(null);
  const playerScanRef = useRef(null);
  const nextMatchRef = useRef(null);

  // ── Match state (PERSISTED — overleeft refresh tijdens wedstrijd) ──
  const [status,setStatus]   = usePersistedState("status", "PRE");
  const [home,setHome]       = usePersistedState("home", 0);
  const [away,setAway]       = usePersistedState("away", 0);
  const [events,setEvents]   = usePersistedState("events", []);
  const [opponent,setOpp]    = usePersistedState("opponent", "");
  const [oppDraft,setOppDraft] = useState(opponent);
  useEffect(() => { setOppDraft(opponent); }, [opponent]); // sync extern (bv. AI-fetch)

  // ── Koppeling met Supabase (admin): laad club, team en sponsoren van het ingelogde account ──
  useEffect(() => {
    if (!boot) return;
    const c = boot.club, sp = boot.sponsors || [], tms = boot.teams || [];
    if (c) {
      if (c.name) setClubName(c.name);
      if (c.logo_url) setHvLogoUrl('https://images.weserv.nl/?url=' + encodeURIComponent(c.logo_url));
      if (c.ig_handle != null) setIgHandle(c.ig_handle);
      if (c.fb_handle != null) setFbHandle(c.fb_handle);
      if (c.website != null) setClubWebsite(c.website);
      if (c.club_code != null) setClubCode(c.club_code);
    }
    let activeTeam = null;
    if (boot.profile && boot.profile.team_id) activeTeam = tms.find(t => t.id === boot.profile.team_id);
    if (!activeTeam) activeTeam = tms.find(t => (t.name || "").toLowerCase() === (team || "").toLowerCase());
    if (!activeTeam && tms.length) activeTeam = tms[0];
    if (activeTeam && activeTeam.name) setTeam(activeTeam.name);
    setTeamLocked(!!(boot.profile && boot.profile.team_id));
    const tId = activeTeam ? activeTeam.id : null;
    const toSp = (r) => ({ name: r.name || "", url: r.logo_url || null });
    setSponsors(sp.filter(r => r.tier === "goud").map(toSp));
    setSilverSponsors(sp.filter(r => r.tier === "zilver").map(toSp));
    setTeamSponsors(sp.filter(r => r.tier === "brons" && r.team_id === tId).map(toSp));
    const motm = sp.find(r => r.tier === "motm" && r.team_id === tId);
    setMotmSponsor(motm ? toSp(motm) : { name: "", url: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boot]);

  // ── ONLINE/OFFLINE detectie ──
  const [isOnline,setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [appReady,setAppReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAppReady(true), 600);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const goOn = () => setIsOnline(true);
    const goOff = () => setIsOnline(false);
    window.addEventListener("online", goOn);
    window.addEventListener("offline", goOff);
    return () => {
      window.removeEventListener("online", goOn);
      window.removeEventListener("offline", goOff);
    };
  }, []);
  const [mKind,setMKind]     = usePersistedState("mKind", "");
  const [loc,setLoc]         = usePersistedState("loc", "thuis");
  const [kick,setKick]       = usePersistedState("kick", "");
  const [weather,setWeather] = usePersistedState("weather", "");
  const [elapsed,setElapsed] = usePersistedState("elapsed", 0);
  const [paused,setPaused] = usePersistedState("paused", false);
  // Wall-clock ankers — tijd op basis van echte klok zodat hij niet achterloopt bij app-switch
  const [startTs,setStartTs]         = usePersistedState("startTs", 0);       // ms-tijdstip van minuut 1
  const [pausedMs,setPausedMs]       = usePersistedState("pausedMs", 0);      // opgebouwde rust in ms
  const [pauseStartTs,setPauseStartTs] = usePersistedState("pauseStartTs", 0); // start van huidige rust (0 = niet in rust)
  const [sponsorOffset,setSponsorOffset] = useState(0);
  const [showDemo,setShowDemo] = useState(false);
  const [blockReminder,setBlockReminder] = useState(null); // {label, end}
  const [reminderShown,setReminderShown] = useState({});
  const [addMoment,setAddMoment] = useState(null); // moment type config
  const [addSpecial,setAddSpecial] = useState(null);
  const timer = useRef(null);
  // Opponent logo (PERSISTED)
  const [oppLogoUrl,setOppLogoUrl]     = usePersistedState("oppLogoUrl", "");
  const [oppLogoLoading,setOppLogoLoading] = useState(false);
  const [oppLogoMsg,setOppLogoMsg]     = useState("");

  // Zodra internet terugkomt: logo opnieuw proberen (staat hier ná oppLogoUrl declaratie)
  useEffect(() => {
    if (isOnline && opponent && !oppLogoUrl && !oppLogoLoading) {
      setTimeout(() => triggerOppLogoSearch(), 800);
    }
  }, [isOnline]); // eslint-disable-line

  // Zoek het tegenstander-logo zodra de tegenstander bekend is — ook bij het
  // opstarten uit opgeslagen staat (los van internet-status wijzigingen).
  useEffect(() => {
    if (opponent && opponent.trim().length >= 3 && !oppLogoUrl && !oppLogoLoading) {
      triggerOppLogoSearch();
    }
  }, [opponent]); // eslint-disable-line

  // ── Match analysis (PERSISTED) ──
  const [algBeld,setAlgBeld] = usePersistedState("algBeld", "");
  const [h1f1,setH1f1]     = usePersistedState("h1f1", "");
  const [h1f2,setH1f2]     = usePersistedState("h1f2", "");
  const [h1f3,setH1f3]     = usePersistedState("h1f3", "");
  const [h2f1,setH2f1]     = usePersistedState("h2f1", "");
  const [h2f2,setH2f2]     = usePersistedState("h2f2", "");
  const [h2f3,setH2f3]     = usePersistedState("h2f3", "");
  const [motm,setMotm]       = usePersistedState("motm", "");
  const [motmRedenen,setMotmRedenen] = usePersistedState("motmRedenen", []);
  const toggleMotmReden = (key) => setMotmRedenen(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev,key]);
  // MOTM slogan generator — pakkende kreet op basis van geselecteerde redenen
  const getMotmSlogan = (redenen) => {
    if (!redenen || redenen.length === 0) return "UITBLINKER";
    const has = (k) => redenen.includes(k);
    // Combinaties (worden eerst gecheckt)
    if (has("hattrick") && has("leader"))  return "MATCHWINNER";
    if (has("hattrick") && has("goal"))    return "GENADELOOS";
    if (has("saves") && has("penstop"))    return "ONOVERWINNELIJK";
    if (has("defender") && has("leader"))  return "ROTSVAST";
    if (has("goal") && has("assist"))      return "ALLESBEPALEND";
    if (has("saves") && has("leader"))     return "STEUNPILAAR";
    if (has("workrate") && has("leader"))  return "DE HARDE WERKER";
    if (has("playmaker") && has("assist")) return "DE REGISSEUR";
    // Enkele redenen
    if (has("hattrick"))  return "DE KILLER";
    if (has("penstop"))   return "PENALTY-KILLER";
    if (has("saves"))     return "DE REDDER IN NOOD";
    if (has("goal"))      return "BESLISSEND";
    if (has("assist"))    return "DE AANGEVER";
    if (has("playmaker")) return "DE MOTOR VAN DE PLOEG";
    if (has("defender"))  return "HET SLOT";
    if (has("leader"))    return "DE CAPTAIN";
    if (has("workrate"))  return "ONVERZETTELIJK";
    return "UITBLINKER";
  };
  // MOTM quote - langere pakkende uitspraak op de story
  const getMotmQuote = (redenen, name) => {
    // Slim voornaam extraheren — skip Dutch tussenvoegsels (van, de, den...)
    const TUSSENV = new Set(["van","de","den","der","ter","te","het","'t","in","bij","op"]);
    const nameParts = (name || "").trim().split(/\s+/);
    const n = nameParts.length > 0 && !TUSSENV.has(nameParts[0].toLowerCase())
      ? nameParts[0]
      : (nameParts.length > 1 ? nameParts[nameParts.length-1] : (nameParts[0] || "Hij"));
    if (!redenen || redenen.length === 0) return `${n} stak er bovenuit en bekroonde z'n optreden als Man of the Match.`;
    const has = (k) => redenen.includes(k);
    // Combinaties krijgen voorrang
    if (has("saves") && has("penstop"))   return `Een muur tussen de palen. ${n} hield z'n team in de wedstrijd — inclusief een gestopte strafschop.`;
    if (has("hattrick") && has("leader")) return `Drie keer raak én bovenliggend in elk duel: ${n} ging vandaag voorop in de strijd.`;
    if (has("hattrick") && has("goal"))   return `Genadeloos voor de goal. ${n} besliste het duel met een hattrick.`;
    if (has("defender") && has("leader")) return `Foutloos in de defensie, de baas in elke duel — ${n} leidde de ploeg.`;
    if (has("goal") && has("assist"))     return `Allesbepalend in de eindfase: ${n} bezorgde z'n ploeg het beslissende moment.`;
    if (has("saves") && has("leader"))    return `Steunpilaar op de belangrijkste momenten. ${n} hield het team overeind.`;
    if (has("workrate") && has("leader")) return `Met onverzettelijkheid en kracht leidde ${n} z'n ploeg naar de overwinning.`;
    if (has("playmaker") && has("assist"))return `De speler die elke aanval startte. ${n} regisseerde de wedstrijd van A tot Z.`;
    // Enkele redenen
    if (has("hattrick"))  return `Drie keer raak: ${n} besliste de wedstrijd in z'n eentje.`;
    if (has("penstop"))   return `De held van de middag: ${n} stopte een cruciale strafschop.`;
    if (has("saves"))     return `Een keeper kan een wedstrijd winnen — vandaag bewees ${n} dat opnieuw.`;
    if (has("goal"))      return `Het beslissende moment kwam van ${n} — koelbloedig op het juiste moment.`;
    if (has("assist"))    return `Onmisbaar in de aanval: ${n} stond aan de basis van iedere goal.`;
    if (has("playmaker")) return `De man die alles dirigeerde vanaf het middenveld: ${n} liet z'n elftal lopen.`;
    if (has("defender"))  return `Geen speler kwam hem voorbij. ${n} was vandaag de baas in de defensie.`;
    if (has("leader"))    return `Met overtuiging en klasse hielp ${n} z'n ploeg aan de overwinning.`;
    if (has("workrate"))  return `Onvermoeibaar, onverzettelijk, onmisbaar — ${n} liet zien wat karakter is.`;
    return `${n} stak er bovenuit en bekroonde z'n optreden als Man of the Match.`;
  };
  const [stars,setStars]     = usePersistedState("stars", []);
  const [newStar,setNewStar] = useState("");
  const [bijzT,setBijzT]   = usePersistedState("bijzT", []);
  const [bijzN,setBijzN]   = usePersistedState("bijzN", "");
  const [keyMoments,setKeyMoments] = usePersistedState("keyMoments", []); // [{type, minute, player, player2?}]
  const [specialInfo,setSpecialInfo] = usePersistedState("specialInfo", []); // [{type, player?}]

  // ── Navigation ──
  // Punt 8: onthoud het laatst gebruikte scherm bij wisselen van apps (sessionStorage
  // blijft bij app-wissel, maar wordt gewist bij volledig afsluiten → dan weer dashboard).
  const [screen,setScreen]         = useState(()=>{
    try { return sessionStorage.getItem("matchly_screen") || "dashboard"; } catch { return "dashboard"; }
  });
  useEffect(()=>{
    try { sessionStorage.setItem("matchly_screen", screen); } catch {}
  },[screen]);
  // Punt 6: onthoud welke schermen je bezocht hebt, zodat "Terug" één stap teruggaat.
  const screenHistory = useRef(["dashboard"]);
  useEffect(()=>{
    const h = screenHistory.current;
    if (h[h.length-1] !== screen) h.push(screen);
    if (h.length > 12) h.shift();
  },[screen]);
  const goBack = () => {
    const h = screenHistory.current;
    h.pop();                       // huidige scherm eraf
    const target = h[h.length-1] || "dashboard";
    setScreen(target);
  };
  const [clubSection,setClubSection] = useState("main"); // "main" | "spelerslijst" | "sponsoren" | "distributie"
  const [settingsTab,setSettingsTab] = useState("club"); // "club" | "team"
  const [hasStarted,setHasStarted] = useState(false);
  const [showBasis,setShowBasis] = useState(false); // punt 11: basisopstelling-chips tonen/verbergen
  const [modal,setModal]           = useState(null);
  const [confirm,setConfirm]       = useState(false);

  // ── AI output (PERSISTED — bespaart API calls bij refresh) ──
  const [aiOut,setAiOut]     = usePersistedState("aiOut", null);
  const [locked,setLocked]   = usePersistedState("locked", false); // punt: na genereren staan wedstrijdgegevens op slot
  const [loading,setLoading] = useState(false);
  const [aiErr,setAiErr]     = useState(null);
  const [archive,setArchive] = usePersistedState("archive", []);
  const [expandedArchive,setExpandedArchive] = useState(null);

  // Snapshot van huidige wedstrijd naar archief
  const archiveMatch = (aiContent) => {
    const snap = {
      id: Date.now(),
      date: matchDate || new Date().toISOString().slice(0,10),
      club: clubName, team, opponent: opponent || "Onbekend",
      home, away, mKind, loc,
      events: events.map(e=>({type:e.type,half:e.half||null,minute:e.minute||null,extra:!!e.extra,player:e.player||null,assist:e.assist||null,reason:e.reason||null,playerOut:e.playerOut||null,playerIn:e.playerIn||null,note:e.note||null})),
      keyMoments: keyMoments.map(k=>({type:k.type.label,team:k.team==="tegenstander"?"tegenstander":(clubName||"eigen ploeg"),minute:k.minute,player:k.player||null,player2:k.player2||null})),
      specialInfo: specialInfo.map(s=>({type:s.type.label,player:s.player||null})),
      motm: motm || null,
      motmRedenen: [...motmRedenen],
      bijzT: [...bijzT], bijzN,
      stars: [...stars],
      aiOut: aiContent ? {
        headline: aiContent.headline,
        verslag: aiContent.verslag,
        samenvatting: aiContent.samenvatting,
        instagram: aiContent.instagram,
      } : null,
    };
    setArchive(prev => {
      // Voorkom dubbel: als laatste entry < 2 min geleden en zelfde tegenstander → vervang
      const recent = prev[0];
      if (recent && recent.opponent===snap.opponent && (Date.now()-recent.id)<2*60*1000) {
        return [snap, ...prev.slice(1)].slice(0, 100);
      }
      return [snap, ...prev].slice(0, 100);
    });
  };
  const [copied,setCopied]   = useState(null);
  const [dl,setDl]           = useState(false);
  const instaRef = useRef(null);
  const visRef   = useRef(null);
  const scrollRef = useRef(null);
  const [visStyle,setVisStyle] = useState(0);
  const [chosenTheme,setChosenTheme] = usePersistedState("chosenTheme", null);
  const [stijlMenuOpen,setStijlMenuOpen] = useState(false);
  const [checklist,setChecklist] = usePersistedState("checklist", {afb:false,wa:false,mail:false,social:false});
  const toggleCheck = (k) => setChecklist(p=>({...p,[k]:!p[k]}));

  // ── ACTIVE SQUAD + PUSH NOTIFICATIES ── (moet ná alle state declaraties)
  const sortedSquad = [...squad].sort((a,b)=>{
    const aBase = baseSquad.includes(a), bBase = baseSquad.includes(b);
    if(aBase && !bBase) return -1;
    if(!aBase && bBase) return 1;
    return 0;
  });
  // ── Bereken actieve squad (op het veld) en bench (wissels)
  //    Begin met baseSquad, pas alle SUB events toe in chronologische volgorde
  //    Fallback: als geen basis gekozen, gebruik volle squad
  const activeSquad = (() => {
    if (baseSquad.length === 0) return [...squad]; // geen basis → alle spelers zijn beschikbaar
    let active = [...baseSquad];
    const subs = [...events].filter(e=>e.type==="SUB").sort((a,b)=>(+a.minute||0)-(+b.minute||0));
    subs.forEach(sub => {
      if (sub.playerOut) active = active.filter(p => p !== sub.playerOut);
      if (sub.playerIn && !active.includes(sub.playerIn)) active.push(sub.playerIn);
    });
    return active;
  })();
  // Bank = squad minus actieve spelers, minus basisspelers (kunnen niet binnen-gewisseld), minus reeds gewisselde spelers
  const subbedOutPlayers = events.filter(e => e.type === "SUB").map(e => e.playerOut).filter(Boolean);
  const benchSquad = squad.filter(p =>
    !activeSquad.includes(p) &&         // niet al op het veld
    !baseSquad.includes(p) &&           // geen basisspeler (basis is basis — niet voor wisselen)
    !subbedOutPlayers.includes(p)       // niet al eerder gewisseld geweest
  );

  // ── PUSH NOTIFICATIES ──────────────────────────────────────
  // Helper: stuur een browser-melding (vraagt toestemming bij eerste gebruik)
  const pushNotify = (title, body) => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      try { new Notification(title, { body, icon: IG_ICON, badge: IG_ICON }); } catch(e) {}
    }
  };
  const requestNotifyPermission = async () => {
    if (typeof Notification === "undefined") return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    try { return await Notification.requestPermission(); } catch(e) { return "denied"; }
  };

  // 5 min vóór wedstrijd → push notificatie naar invuller
  useEffect(() => {
    if (status !== "PRE") return;
    if (!matchDate || !kick) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const [hh, mm] = kick.split(":").map(Number);
    if (isNaN(hh) || isNaN(mm)) return;
    const matchTime = new Date(matchDate);
    matchTime.setHours(hh, mm, 0, 0);
    const notifyAt = matchTime.getTime() - 5*60*1000;
    const delay = notifyAt - Date.now();
    if (delay <= 0 || delay > 2147483000) return;   // max ~24 dagen, anders skip
    const t = setTimeout(() => {
      pushNotify(
        "⚽ Wedstrijd begint zo",
        opponent ? `Over 5 minuten begint de wedstrijd tegen ${opponent}.` : "Over 5 minuten begint de wedstrijd."
      );
    }, delay);
    return () => clearTimeout(t);
  }, [matchDate, kick, status, opponent]);

  // Bij spelbeeld-blokreminder → ook een push notificatie
  useEffect(() => {
    if (!blockReminder) return;
    pushNotify(
      "📋 Spelbeeld invullen",
      `Blok ${blockReminder.label}' afgerond. Vul het spelbeeld in voor deze fase.`
    );
  }, [blockReminder]);

  // ── HV embed URL ──
  const hvEmbedUrl = hvCompUrl.trim()
    ? hvCompUrl.trim().replace("www.hollandsevelden.nl","embed.hollandsevelden.nl").replace("http://","https://")
    : "";

  // ── Computed ──
  const isHeren1 = team === "Heren 1";
  // Bij Heren 1 gewoon de clubnaam, anders clubnaam + teamnaam
  const teamLabel = isHeren1 ? "" : team;
  const fullTeamName = teamLabel ? `${clubName} ${teamLabel}` : clubName;

  // Reset club section when leaving club screen
  useEffect(()=>{
    if(screen !== "club") setClubSection("main");
  },[screen]);

  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTo({top:0,behavior:"instant"});
  },[screen, status]);

  // Live timer — gebaseerd op de echte klok (loopt niet achter bij app-switch)
  useEffect(()=>{
    if(status!=="LIVE") return;
    const syncElapsed = () => {
      if(!startTs) return;
      const now = Date.now();
      const curPause = (paused && pauseStartTs) ? (now - pauseStartTs) : 0;
      const min = Math.max(1, Math.floor((now - startTs - pausedMs - curPause)/60000) + 1);
      setElapsed(min);
    };
    syncElapsed();                                   // direct bijwerken
    let id = null;
    if(!paused) id = setInterval(syncElapsed, 15000); // elke 15s herberekenen
    const onVis = () => { if(document.visibilityState==="visible") syncElapsed(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", syncElapsed);
    return ()=>{
      if(id) clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", syncElapsed);
    };
  },[status,paused,startTs,pausedMs,pauseStartTs]);

  // Spelbeeld blok-grenzen → reminder
  useEffect(()=>{
    if (status !== "LIVE") return;
    const blocks = [[0,20],[21,35],[36,45],[45,65],[66,80],[81,90]];
    for (const [start,end] of blocks) {
      if (elapsed === end+1 && !reminderShown[end]) {
        setBlockReminder({ start, end, label: `${start}–${end}` });
        setReminderShown(p => ({...p, [end]: true}));
        break;
      }
    }
  },[elapsed,status]);

  // Push: rust-herinnering op minuut 45 (eenmalig)
  useEffect(()=>{
    if (status !== "LIVE") return;
    if (elapsed !== 45) return;
    if (reminderShown.rust45) return;
    setReminderShown(p => ({...p, rust45: true}));
    pushNotify("⏸️ Tijd voor de rust", "Druk op de knop 'Wedstrijdtijd pauzeren' om de rust in te luiden.");
  },[elapsed,status]);

  // Push: 12 minuten na pauze → klaar voor 2e helft
  useEffect(()=>{
    if (status !== "LIVE") { pauseStartRef.current = null; return; }
    if (!paused) { pauseStartRef.current = null; return; }
    // Pauze net begonnen
    pauseStartRef.current = Date.now();
    const t = setTimeout(() => {
      pushNotify("⚽ Klaar voor de 2e helft?", "Druk zo op 'Wedstrijdtijd hervatten' om de tweede helft te starten.");
    }, 12 * 60 * 1000);
    return () => clearTimeout(t);
  },[paused,status]);

  // Sponsor rotatie — één gedeeld tempo voor hoofdsponsoren en teamsponsoren
  // Wanneer rotatie nodig is: meer hoofdsponsoren dan club-slots, OF meer dan 1 teamsponsor
  useEffect(()=>{
    const hasTeam = teamSponsors.length > 0;
    const maxClub = hasTeam ? 4 : 5;
    const clubNeedsRotation = sponsors.length > maxClub;
    const teamNeedsRotation = teamSponsors.length > 1;
    if(!clubNeedsRotation && !teamNeedsRotation) return;
    const t=setInterval(()=>setSponsorOffset(o=>o+1),sponsorSpeed);
    return ()=>clearInterval(t);
  },[sponsors.length,sponsorSpeed,teamSponsors.length]);

  // Sponsorbalk: hoofdsponsoren (club, max 4 slots) + 1 vast teamsponsor-slot
  // - Als er geen teamsponsoren zijn: hoofdsponsoren vullen alle 5 slots
  // - Als er 1+ teamsponsoren zijn: het team-slot wisselt door tussen alle teamsponsoren
  const hasTeamSponsors = teamSponsors.length > 0;
  const maxClubSlots = hasTeamSponsors ? 4 : 5;
  const visSponsors = (()=>{
    // Club-slice: 4 of 5 hoofdsponsoren met rotatie
    let clubSlice;
    if(sponsors.length <= maxClubSlots) {
      clubSlice = sponsors;
    } else {
      // Stap-grootte = aantal slots: na maxClubSlots ticks zijn we 1 volledige set verder
      const clubOffset = (sponsorOffset * maxClubSlots) % sponsors.length;
      clubSlice = [];
      for(let i=0;i<maxClubSlots;i++) clubSlice.push(sponsors[(clubOffset+i)%sponsors.length]);
    }
    if(!hasTeamSponsors) return clubSlice;
    // Team-slot: wissel door teamsponsoren op dezelfde tick
    const currentTeam = teamSponsors[sponsorOffset % teamSponsors.length];
    return [...clubSlice, { ...currentTeam, _isTeam:true }];
  })();

  // Sponsor-niveaus met randkleur (goud/zilver/brons)
  const TIER_GOLD = "#d4af37", TIER_SILVER = "#c4c4cc", TIER_BRONZE = "#cd7f32";
  const goldSp   = sponsors.slice(0, 5).map(s=>({...s, _tier:"goud"}));
  const silverSp = silverSponsors.slice(0, 4).map(s=>({...s, _tier:"zilver"}));
  const bronzeSp = teamSponsors.slice(0, 1).map(s=>({...s, _tier:"brons"}));
  // Match post: alleen 5 goud (hoofdsponsoren)
  const postSponsors = goldSp;
  // Story + MOTM-story: 5 goud + 4 zilver + 1 brons (zelfde sponsors op beide)
  const storySponsors = [...goldSp, ...silverSp, ...bronzeSp];
  const tierColor = (s) => s._tier==="goud"?TIER_GOLD : s._tier==="zilver"?TIER_SILVER : s._tier==="brons"?TIER_BRONZE : null;
  // Gradient per niveau (render-veilig voor html2canvas: gradient als achtergrond van een wrapper)
  const tierGradient = (s) => s._tier==="goud"   ? "linear-gradient(135deg,#fcefb4 0%,#e6c14e 35%,#b8860b 70%,#f5d97a 100%)"
                            : s._tier==="zilver" ? "linear-gradient(135deg,#f4f5fa 0%,#cdced6 35%,#8e8e99 70%,#e3e4ea 100%)"
                            : s._tier==="brons"  ? "linear-gradient(135deg,#eab97e 0%,#cd7f32 35%,#8f5420 70%,#dca066 100%)"
                            : "#cccccc";

  // ── Logo Search: eerst Supabase cache, dan find-logo als fallback ──
  const searchHvLogo = async (naam, setUrl, setLoading_, setMsg) => {
    if (!naam.trim()) return;
    setLoading_(true);
    setMsg("");

    // STAP 1: probeer eerst de Supabase-cache
    try {
      const cachedUrl = await getLogoFromSupabase(naam);
      if (cachedUrl) {
        setUrl(cachedUrl);
        setMsg("✓ Logo gevonden (cache)");
        setLoading_(false);
        return;
      }
    } catch (cacheErr) {
      console.log("Supabase cache lookup faalde:", cacheErr);
    }

    // STAP 2: niet in cache → zoek via find-logo
    try {
      const res = await fetch("/.netlify/functions/find-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName: naam.trim() })
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();

      if (data.logoUrl) {
        setUrl(data.logoUrl);
        setMsg("✓ Logo gevonden");
        // STAP 3: bewaar in Supabase voor volgende keer
        saveLogoToSupabase(naam, data.displayName || naam, data.logoUrl).catch(saveErr => {
          console.log("Supabase opslaan faalde:", saveErr);
        });
      } else {
        setMsg(data.reason || "Niet gevonden — upload handmatig");
      }
    } catch (e) {
      setMsg("Zoeken mislukt — " + (e.message || "onbekende fout"));
    }
    setLoading_(false);
  };

  // ── Auto-trigger helpers (fire on Enter/Done or blur) ──
  // Voor eigen club: skip als gebruiker eigen logo heeft geüpload
  const triggerClubLogoSearch = () => {
    const naam = clubName.trim();
    if (naam.length < 3) return;
    if (logo) return;              // eigen upload heeft voorrang
    if (hvLogoLoading) return;
    if (hvLogoUrl) return;          // al geladen — gebruiker moet eerst wissen
    searchHvLogo(naam, setHvLogoUrl, setHvLogoLoading, setHvLogoMsg);
  };
  const triggerOppLogoSearch = () => {
    const naam = opponent.trim();
    if (naam.length < 3) return;
    if (oppLogoLoading) return;
    if (oppLogoUrl) return;         // al geladen
    if (!isOnline) { setOppLogoMsg("📵 Offline — logo wordt opgehaald zodra je online bent"); return; }
    searchHvLogo(naam, setOppLogoUrl, setOppLogoLoading, setOppLogoMsg);
  };

  // ── voetbal.nl team ID search ──
  const searchTeamId = async () => {
    if(!clubName.trim()) return;
    setTeamIdLoading(true); setTeamIdMsg("");
    try {
      const vraag = `Zoek het KNVB team-ID voor "${clubName} ${team}" op voetbal.nl. Het team-ID staat in de URL: voetbal.nl/teams/nederland/team/[ID]/show/. Geef ALLEEN het numerieke ID terug, niets anders.`;
      const res = await fetch("/.netlify/functions/anthropic",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,tools:[{"type":"web_search_20250305","name":"web_search"}],messages:[{role:"user",content:vraag}]})
      });
      const data = await res.json();
      const blocks = data.content || [];
      const toolBlocks = blocks.filter(b=>b.type==="tool_use");
      let finalData = data;
      if(toolBlocks.length > 0) {
        const res2 = await fetch("/.netlify/functions/anthropic",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:200,tools:[{"type":"web_search_20250305","name":"web_search"}],messages:[{role:"user",content:vraag},{role:"assistant",content:blocks},{role:"user",content:toolBlocks.map(tb=>({type:"tool_result",tool_use_id:tb.id,content:"Verwerk de resultaten."}))}]})
        });
        finalData = await res2.json();
      }
      const txt = (finalData.content||[]).map(b=>b.type==="text"?b.text:"").join("").trim();
      const match = txt.match(/\d{4,8}/);
      if(match) { setTeamId(match[0]); setTeamIdMsg(`Team gevonden: ID ${match[0]}`); }
      else { setTeamIdMsg("Niet gevonden — vul het ID handmatig in via voetbal.nl"); }
    } catch(e) {
      setTeamIdMsg("Zoeken mislukt — vul het ID handmatig in");
    }
    setTeamIdLoading(false);
  };

  // ── CSV / Paste import ──
  const handleCsvImport = e => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.split(/\r?\n/).filter(Boolean);
      if(!lines.length) return;
      const header = lines[0].split(/[,;]/).map(h=>h.trim().toLowerCase().replace(/"/g,""));
      const nameIdx = header.findIndex(h=>h.includes("naam")||h.includes("name")||h.includes("speler"));
      const vorIdx  = header.findIndex(h=>h.includes("voor")||h.includes("first"));
      const achIdx  = header.findIndex(h=>h.includes("achter")||h.includes("last")||h.includes("surname"));
      const names = [];
      lines.slice(1).forEach(line=>{
        const cols = line.split(/[,;]/).map(c=>c.trim().replace(/"/g,""));
        let name = "";
        if(nameIdx>=0 && cols[nameIdx]) name = cols[nameIdx];
        else if(vorIdx>=0 && achIdx>=0) name = `${cols[vorIdx]||""} ${cols[achIdx]||""}`.trim();
        else if(cols[0]) name = cols[0];
        if(name && name.length>1) names.push(name);
      });
      const nieuweSpelers = names.filter(n=>!squad.includes(n));
      setSquad(prev=>[...prev,...nieuweSpelers]);
      setImportMode(""); e.target.value="";
    };
    reader.readAsText(file,"UTF-8");
  };

  const handlePasteImport = () => {
    const namen = pasteText.split(/\r?\n/).map(n=>n.trim()).filter(n=>n.length>1 && !squad.includes(n));
    if(namen.length) { setSquad(prev=>[...prev,...namen]); setPasteText(""); setImportMode(""); }
  };

  // ── Match actions ──
  const addEv = ev => {
    if(locked) return;
    setEvents(p=>[...p,ev].sort((a,b)=>(+a.minute||0)-(+b.minute||0)));
    if(ev.type==="GOAL") setHome(s=>s+1);
    if(ev.type==="OWN")  setAway(s=>s+1);
  };
  const delEv = id => {
    if(locked) return;
    const ev=events.find(e=>e.id===id);
    if(ev?.type==="GOAL") setHome(s=>Math.max(0,s-1));
    if(ev?.type==="OWN")  setAway(s=>Math.max(0,s-1));
    setEvents(p=>p.filter(e=>e.id!==id));
  };
  const cp = (txt,k) => { navigator.clipboard.writeText(txt); setCopied(k); setTimeout(()=>setCopied(null),2500); };
  const startMatch = () => { setHasStarted(true); setStatus("LIVE"); setStartTs(Date.now()); setPausedMs(0); setPauseStartTs(0); setElapsed(1); setScreen("dashboard"); };
  // Rust starten/hervatten — telt de rusttijd correct mee in de klok
  const togglePause = () => {
    const now = Date.now();
    if(!paused){
      setPauseStartTs(now);            // rust begint
    } else {
      if(pauseStartTs) setPausedMs(m => m + (now - pauseStartTs));  // rust optellen
      setPauseStartTs(0);
    }
    setPaused(p => !p);
  };
  // Handmatige tijdcorrectie — verschuift het starttijdstip zodat de klok-sync dit respecteert
  const adjustTime = (deltaMin) => {
    setStartTs(ts => ts ? ts - deltaMin*60000 : ts);
    setElapsed(e => Math.max(1, e + deltaMin));
  };

  const resetMatch = () => {
    setHasStarted(false); setStatus("PRE"); setHome(0); setAway(0); setEvents([]);
    setOpp(""); setMKind(""); setLoc("thuis"); setKick(""); setMatchDate(""); setWeather(""); setElapsed(0);
    setReminderShown({}); setBlockReminder(null); setPaused(false); setStartTs(0); setPausedMs(0); setPauseStartTs(0);
    setAlgBeld(""); setH1f1(""); setH1f2(""); setH1f3("");
    setH2f1(""); setH2f2(""); setH2f3("");
    setMotm(""); setStars([]); setBijzT([]); setBijzN(""); setMotmRedenen([]);
    setKeyMoments([]); setSpecialInfo([]);                  // wedstrijdmomenten + bijzonderheden leegmaken
    setOppLogoUrl(""); setOppLogoMsg("");
    setAiOut(null); setLocked(false); setAiErr(null); setScreen("dashboard");
    // chosenTheme NIET resetten — laatst gekozen design-keuze blijft voor de volgende wedstrijd (gebruiksgemak)
    setChecklist({afb:false,wa:false,mail:false,social:false});
    // autoFetchedRef NIET resetten — na 1e auto-fetch geen automatische ophaal meer (alleen via ↻ knop)
  };


  const exportMatchJson = () => {
    let hs=0,as=0;
    const evW=events.map(e=>{const ev={...e};if(e.type==="GOAL"){hs++;ev.standNa=`${hs}-${as}`;}else if(e.type==="OWN"){as++;ev.standNa=`${hs}-${as}`;}return ev;});
    const log={versie:"1.0",exportDatum:new Date().toISOString(),wedstrijd:{club:clubName,team,tegenstander:opponent||"Onbekend",uitslag:{eigen:home,tegen:away},locatie:loc,type:mKind||null},events:evW.map(e=>({type:e.type,minuut:e.minute?parseInt(e.minute):null,speler:e.player||null,assist:e.assist||null,standNa:e.standNa||null})),manOfTheMatch:motm||null,gegenereerdeContent:aiOut?{headline:aiOut.headline,verslag:aiOut.verslag,samenvatting:aiOut.samenvatting,instagram:aiOut.instagram}:null};
    const blob=new Blob([JSON.stringify(log,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.download=`matchly_${clubName.replace(/\s+/g,"_")}_${home}-${away}.json`;
    a.href=url;a.click();URL.revokeObjectURL(url);
  };

  // ── Eerstvolgende wedstrijd ophalen via Claude API (web search) ──
  const fetchNextMatch = async () => {
    if (!isOnline) { setNextMatchErr("📵 Geen internet"); return; }
    if (nextMatchLoading) return;
    setNextMatchLoading(true);
    setNextMatchMsg("");
    try {
      const today = new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"});
      const fullTeam = `${clubName} ${isHeren1?team:team}`.trim();
      const compInfo = hvCompUrl
        ? `De competitie staat op deze HollandsVelden URL: ${hvCompUrl}`
        : `Zoek op voetbal.nl of de KNVB competitiepagina voor ${clubName} ${team}.`;

      const vraag = `Zoek de eerstvolgende geplande wedstrijd voor "${fullTeam}" — inclusief vandaag (${today}) of later.

${compInfo}

Gebruik de web_fetch tool om de pagina op te halen en de eerstvolgende wedstrijd uit het wedstrijdprogramma te halen. Let goed op:
- Pak de eerstvolgende wedstrijd vanaf (en INCLUSIEF) vandaag (${today}). Dus als er vandaag een wedstrijd is, gebruik die.
- De wedstrijd kan thuis of uit zijn
- Geef tegenstandernaam exact zoals op de pagina staat
- Voor "wedstrijdtype": kies tussen "Competitie" of "Beker" op basis van wat de pagina aangeeft. Standaard is "Competitie".

Geef ALLEEN dit JSON terug, geen tekst eromheen:
{
  "tegenstander": "Exacte naam tegenstander",
  "datum": "YYYY-MM-DD",
  "tijd": "HH:MM",
  "thuis_uit": "thuis",
  "wedstrijdtype": "Competitie",
  "competitie": "Naam competitie (bv. Zaterdag Hoofdklasse A)",
  "vertrouwen": "hoog"
}

Als je het niet zeker weet, gebruik "vertrouwen": "laag". Als je niets vindt, geef terug: {"error":"Geen wedstrijd gevonden"}.`;

      const d = await callClaudeAPI({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        tools: [{type:"web_fetch_20250910",name:"web_fetch",max_uses:3}],
        messages: [{role:"user",content:vraag}],
      });

      // Lees laatste text block
      const txt = (d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join(" ");
      const jsonMatch = txt.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Geen JSON in antwoord");
      const result = JSON.parse(jsonMatch[0]);

      if (result.error) {
        setNextMatchMsg("⚠ Geen wedstrijd gevonden. Vul handmatig in.");
        return;
      }

      // Vul de velden
      if (result.tegenstander) setOpp(result.tegenstander);
      if (result.datum) setMatchDate(result.datum);
      if (result.tijd) setKick(result.tijd);
      if (result.thuis_uit) setLoc(result.thuis_uit==="uit"?"uit":"thuis");
      if (result.wedstrijdtype) setMKind(result.wedstrijdtype);

      // Trigger opponent logo zoek
      if (result.tegenstander) {
        setTimeout(()=>{ searchHvLogo(result.tegenstander, setOppLogoUrl, setOppLogoLoading, setOppLogoMsg); }, 300);
      }

      const conf = result.vertrouwen||"midden";
      const dateStr = result.datum ? new Date(result.datum).toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long"}) : "";
      setNextMatchMsg(`✓ ${result.tegenstander}${dateStr?` · ${dateStr}`:""}${conf==="laag"?" (controleer)":""}`);
    } catch(e) {
      setNextMatchMsg("⚠ Ophalen mislukt — "+(e.message||"onbekende fout"));
    } finally {
      setNextMatchLoading(false);
    }
  };

  // Auto-fetch eerstvolgende wedstrijd zodra de app opent (eenmalig per sessie)
  const autoFetchedRef = useRef(false);
  const pauseStartRef   = useRef(null);
  useEffect(() => {
    if (autoFetchedRef.current) return;
    if (status !== "PRE") return;
    if (hasStarted) return;          // wedstrijd is al gestart geweest — geen automatische ophaal meer
    if (!isOnline) return;           // geen internet — sla over
    if (!hvCompUrl) return;          // geen competitie URL = niets om op te zoeken
    if (!aiConsent) return;          // AI moet aan
    if (nextMatchLoading) return;

    // Refetch logica: laat opgeslagen wedstrijd staan t/m de dag erna,
    // pas daarna automatisch de volgende wedstrijd laden.
    if (opponent) {
      if (!matchDate) return;        // opponent ingevuld zonder datum → handmatig, niet overschrijven
      const today = new Date(); today.setHours(0,0,0,0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
      const stored = new Date(matchDate);
      // Stored is op of na gisteren? Dan laten staan.
      if (stored >= yesterday) return;
    }

    autoFetchedRef.current = true;
    // Kleine vertraging zodat de UI eerst rendert
    const t = setTimeout(() => fetchNextMatch(), 600);
    return () => clearTimeout(t);
  }, []);

  const endMatch = async () => {
    if (!isOnline) {
      // Sla wedstrijd lokaal op, sla AI-generatie over tot weer online
      setStatus("FINISHED");
      setScreen("output");
      setAiErr("📵 Geen internet — De content kon niet gemaakt worden. Wedstrijd is opgeslagen. Probeer opnieuw via 'Hergenereer' zodra je online bent.");
      archiveMatch(null);
      return;
    }
    setConfirm(false); setStatus("FINISHED"); setScreen("output");
    setLoading(true); setAiErr(null); setAiOut(null);
    // Bij eerste wedstrijd: pak een willekeurig thema. Daarna onthouden voor gebruiksgemak.
    if (!chosenTheme) {
      const picked = THEMES[Math.floor(Math.random() * THEMES.length)];
      setChosenTheme(picked.id);
    }
    const TYPE_NL = { GOAL:"doelpunt eigen ploeg", OWN:"tegendoelpunt (tegenstander scoorde)", YELLOW:"gele kaart", RED:"rode kaart", SUB:"wissel" };
    const evData = events.map(e=>({type:TYPE_NL[e.type]||e.type,team:e.type==="GOAL"?"eigen ploeg":e.type==="OWN"?"tegenstander":(e.isOpponent?"tegenstander":"eigen ploeg"),half:e.half||null,minute:e.minute?(e.extra?`${e.half==="2"?90:45}+${e.minute}`:String(e.minute)):null,player:e.player||null,assist:e.assist||null,goalType:e.goalType||null,reason:e.reason||null,playerOut:e.playerOut||null,playerIn:e.playerIn||null}));
    const wedstrijdMomenten = keyMoments.map(m=>{const tm=m.team==="tegenstander"?"tegenstander":(clubName||"eigen ploeg");return `${m.minute}' ${m.type.label} — ${tm}${m.player?` (${m.player}${m.player2?` ⇄ ${m.player2}`:""})`:""}`;}).join(", ")||null;
    const bijzondereInfo = specialInfo.map(s=>`${s.type.label}${s.player?` (${s.player})`:""}`).join(", ")||null;
    const md = {club:fullTeamName,opponent:opponent||"Tegenstander",score:`${home}-${away}`,locatie:loc,tijdstip:new Date().toISOString(),weer:weather?(WEATHER.find(w=>w.v===weather)||{}).label||null:null,algemeenBeld:algBeld||null,eersteHelft:{openingsfase:h1f1||null,middenfase:h1f2||null,slotfase:h1f3||null},tweedeHelft:{openingsfase:h2f1||null,middenfase:h2f2||null,slotfase:h2f3||null},motm:(home>=away?motm:null)||null,motmRedenen:(home>=away&&motm&&motmRedenen.length)?MOTM_REDENEN.filter(r=>motmRedenen.includes(r.key)).map(r=>r.label):null,wedstrijdMomenten,bijzondereInfo,toelichting:bijzN.trim()||null,events:evData};
    const goalCount=events.filter(e=>e.type==="GOAL"||e.type==="OWN").length;
    const samenvattingSpec = goalCount<=2
      ? "1 zin, 15-25 woorden. Hou het kort want er gebeurde weinig."
      : goalCount>=5
        ? "2-3 zinnen, 40-60 woorden. Beschrijf het verloop en de beslissende fase."
        : "Maximaal 2 zinnen, 25-35 woorden.";

    const sysAdult=`Je schrijft wedstrijdverslagen voor Matchly, een app voor amateurvoetbalclubs.
SCHRIJFSTIJL: ${stijl}.
Qua vorm en toon sluit je aan bij hoe Voetbalzone.nl, AD Sport en Telesport wedstrijden beschrijven: feitelijk, vloeiend en leesbaar. Geen droge opsomming, maar een lopend verhaal. Zinslengte varieert bewust — kort en lang door elkaar — voor ritme. Geen omhaal van woorden. Schrijf alsof je het aan een voetballiefhebber vertelt die de wedstrijd niet zag maar wel snapt hoe het spel werkt. Varieer openingszin en structuur per verslag.

VOORBEELDEN VAN GOEDE OPENINGEN (qua toon en variatie voor elke uitslag — gebruik de echte clubnamen, niet verzinnen):
- "VV GroenWit pakte op karakter de drie punten tegen SV Blauw-Wit."
- "Een vroege voorsprong gaf VV GroenWit vertrouwen tegen SV Blauw-Wit."
- "Na een rustig begin voerde VV GroenWit het tempo op en versloeg SV Blauw-Wit met 3-2."
- "SV Blauw-Wit was te sterk voor VV GroenWit en pakte terecht de drie punten."
- "VV GroenWit kon het verschil niet maken en ging onderuit tegen SV Blauw-Wit."
- "Een vroege tegentreffer zette de toon — VV GroenWit kwam er niet meer aan te pas."
- "VV GroenWit en SV Blauw-Wit hielden elkaar in evenwicht en deelden de punten."
- "Een punt was het maximale voor VV GroenWit na een gelijkopgaande wedstrijd."
- "VV GroenWit greep net naast de winst en moest genoegen nemen met een gelijkspel."
- "VV GroenWit was oppermachtig en gunde SV Blauw-Wit geen moment om op adem te komen."
- "Een dik verdiende overwinning voor VV GroenWit, dat SV Blauw-Wit volledig overklaste."
- "Van meet af aan de baas — VV GroenWit liet SV Blauw-Wit kansloos."

VOORBEELDEN VAN GOEDE HEADLINES (variatie voor elke uitslag):
- "Tom van der Meer kopt VV GroenWit in slotfase langs SV Blauw-Wit"
- "Karakter levert VV GroenWit de drie punten op tegen SV Blauw-Wit"
- "VV GroenWit houdt stand ondanks twee tegentreffers"
- "VV GroenWit bezwijkt onder druk van SV Blauw-Wit"
- "Vroege achterstand fataal voor VV GroenWit"
- "SV Blauw-Wit te sterk voor vechtend VV GroenWit"
- "VV GroenWit en SV Blauw-Wit komen niet tot een winnaar"
- "Gelijkspel voor VV GroenWit na sterke tweede helft"
- "VV GroenWit pakt een punt maar had meer verdiend"
- "VV GroenWit walst over SV Blauw-Wit heen"
- "Ruime zege voor dominant VV GroenWit"
- "VV GroenWit sloopt SV Blauw-Wit met doelpuntenfestijn"

TAAL: Schrijf in helder Nederlands op B1-niveau. Gebruik gewone, herkenbare woorden. Zeg altijd "coach", nooit "trainer".

REGELS:
- Gebruik ALLEEN de aangeleverde data. Verzin NOOIT spelersnamen, gebeurtenissen of details.
- Geef ALLEEN dit JSON terug (geen tekst eromheen): {"verslag":"...","samenvatting":"...","instagram":"...","headline":"..."}
- Verwerk het spelbeeld chronologisch per fase in het verslag.
- Vermijd clichés als "spannend duel", "de jongens", "goed gestreden", "beide ploegen", "belangrijke punten", "onder toeziend oog van", "knappe prestatie", "uitstekend werk".
- Schrijf actieve zinnen. Vermijd passieve constructies. Begin zinnen gevarieerd (niet steeds met de clubnaam).
- Wissel zinslengte af: combineer korte, krachtige zinnen (5–8 woorden) met langere, beschrijvende zinnen (15–20 woorden). Vermijd drie of meer zinnen van vergelijkbare lengte achter elkaar.
- Schrijf "coach" als één woord — nooit "coach/trainer" of vergelijkbare dubbelingen. Gebruik een natuurlijk lidwoord ervoor (bijv. "De coach besloot te wisselen", niet "Coach besloot te wisselen").
- Gebruik concrete, specifieke bewoordingen. Geen vage omschrijvingen.
- Gebruik nooit het woord "scoreloos" — schrijf altijd "doelpuntloos".
- Bepaal de helft op basis van de minuut: minuut 1 t/m 45 = eerste helft, minuut 46 en later = tweede helft. Beschrijf een helft NOOIT als "doelpuntloos", "rustig" of "stil" als er volgens de minuten in die helft is gescoord. Tel de doelpunten per helft correct.
- Bij elk wedstrijdmoment staat achter het type wie het betreft (de eigen ploeg of de tegenstander). Beschrijf het vanuit het juiste team — bijvoorbeeld "een grote kans voor de thuisploeg" of "een grote kans van de tegenstander". Verwar de twee nooit.
- Een "tegendoelpunt" betekent dat de TEGENSTANDER scoorde — noem dit NOOIT een "eigen goal". Het veld goalType beschrijft hoe er gescoord werd (bv. "Corner" = uit een hoekschop, "Penalty" = strafschop, "Open spel" = uit open spel). Alleen wanneer goalType letterlijk "Eigen goal" is, gaat het om een doelpunt in eigen doel.
- Schrijf nooit "paal" of "lat" — gebruik "het aluminium" of "het houtwerk".
- Schrijf nooit "middenfase" — gebruik "halverwege de wedstrijd".
- Vermijd AI-achtige woorden en zinsopbouw — schrijf zoals een mens het zou zeggen, met natuurlijk gebruik van lidwoorden.
- Controleer je tekst tot slot als een Nederlandse redacteur en herschrijf alle onnatuurlijke of houterige zinnen.
- Zorg voor een logische opbouw: openingsfase → doelpuntenmoment → slotfase → eindstand. Concrete observaties zijn altijd beter.

VERSLAG: 150–250 woorden. Chronologisch per fase. Sluit af met eindstand.
SAMENVATTING: ${samenvattingSpec} Puur voor op de wedstrijdkaart.
INSTAGRAM: 3–5 korte zinnen. Knallend, socialmedia-waardig. Vermeld de teamnaam "${fullTeamName}" in de caption. Hashtags verplicht.
HEADLINE: 1 zin. Pakkend en concreet, geen clichés.`;

    const sysJeugd=`Je schrijft wedstrijdverslagen voor Matchly, een app voor amateurvoetbalclubs.
SCHRIJFSTIJL: Jeugd & Plezier.

DOELGROEP: jeugdteam t/m 12 jaar. Lezers zijn spelertjes, ouders, familie en clubvolgers. De focus ligt op plezier, inzet en beleving — niet op tactiek of analyse.

TOON: enthousiast, positief, warm en speels — maar niet overdreven. Schrijf alsof een jeugdleider of clubvrijwilliger het bericht direct na de wedstrijd deelt met ouders en supporters. Straal warmte, trots, plezier en positieve energie uit.

VOORBEELDEN VAN GOEDE OPENINGEN (qua toon, niet verzinnen):
- "Wat een wedstrijd! De spelertjes van VV GroenWit gaven alles tegen SV Blauw-Wit."
- "De spelertjes van VV GroenWit hebben weer keihard gewerkt vandaag."
- "Met veel plezier speelde VV GroenWit tegen SV Blauw-Wit."

VOORBEELDEN VAN GOEDE HEADLINES:
- "Spelertjes VV GroenWit knokken zich naar de winst"
- "Mooie wedstrijd voor de spelertjes van VV GroenWit"
- "Wat een inzet van VV GroenWit tegen SV Blauw-Wit"

TAAL: heel eenvoudige, toegankelijke woorden. Korte zinnen. Geen moeilijke termen. Zeg "coach", niet "trainer". Gebruik natuurlijke jeugdvoetbalwoorden: spelertjes, team, jongens en meiden, het elftal, wedstrijd, inzet, plezier.

REGELS:
- Gebruik ALLEEN de aangeleverde data. Verzin NOOIT spelersnamen, gebeurtenissen of details.
- Geef ALLEEN dit JSON terug (geen tekst eromheen): {"verslag":"...","samenvatting":"...","instagram":"...","headline":"..."}
- Schrijf korte zinnen (gemiddeld 6–12 woorden). Een enkele langere zin mag, maar wees zuinig.
- Beschrijf wat er gebeurde in begrijpelijke taal. Geen tactiek, geen analyse, geen technische bespiegelingen.
- Schrijf "coach" als één woord — nooit "coach/trainer" of vergelijkbare dubbelingen. Gebruik een natuurlijk lidwoord ervoor (bijv. "De coach besloot te wisselen", niet "Coach besloot te wisselen").
- Gebruik het woord "spelertjes" maximaal 2 keer per verslag. Wissel af met "het team", "de jongens en meiden", "het elftal", de clubnaam of het pronomen "ze". Herstructureer de zin als dat natuurlijker is (bijv. "Het ging gelijk op" in plaats van "De spelertjes speelden gelijk op").
- Gebruik geen emoji's in de tekstoutput.
- Vermijd zakelijke of volwassen woorden ("tactisch", "balbezit", "compact spel", "uitstekend gepresteerd", "knappe prestatie", "beslissende fase").
- Geen kritiek of negatieve opmerkingen over spelertjes, coach of tegenstander.
- Gebruik nooit het woord "scoreloos" — schrijf altijd "doelpuntloos".
- Bepaal de helft op basis van de minuut: minuut 1 t/m 45 = eerste helft, minuut 46 en later = tweede helft. Beschrijf een helft NOOIT als "doelpuntloos", "rustig" of "stil" als er volgens de minuten in die helft is gescoord. Tel de doelpunten per helft correct.
- Bij elk wedstrijdmoment staat achter het type wie het betreft (de eigen ploeg of de tegenstander). Beschrijf het vanuit het juiste team — bijvoorbeeld "een grote kans voor de thuisploeg" of "een grote kans van de tegenstander". Verwar de twee nooit.
- Een "tegendoelpunt" betekent dat de TEGENSTANDER scoorde — noem dit NOOIT een "eigen goal". Het veld goalType beschrijft hoe er gescoord werd (bv. "Corner" = uit een hoekschop, "Penalty" = strafschop, "Open spel" = uit open spel). Alleen wanneer goalType letterlijk "Eigen goal" is, gaat het om een doelpunt in eigen doel.
- Schrijf nooit "paal" of "lat" — gebruik "het aluminium" of "het houtwerk".
- Schrijf nooit "middenfase" — gebruik "halverwege de wedstrijd".
- Vermijd AI-achtige woorden en zinsopbouw — schrijf zoals een mens het zou zeggen, met natuurlijk gebruik van lidwoorden.
- Controleer je tekst tot slot als een Nederlandse redacteur en herschrijf alle onnatuurlijke of houterige zinnen.
- Benoem doelpuntenmakers, wissels en bijzondere momenten. Voeg waar passend kleine, positieve observaties toe over inzet, plezier of sfeer.
- Schrijf actieve zinnen. Begin zinnen gevarieerd (niet steeds met de clubnaam).

VERSLAG: 120–180 woorden. Vertel in chronologische volgorde wat er gebeurde. Sluit af met een warme zin over de inzet of het plezier.
SAMENVATTING: ${samenvattingSpec} Eenvoudig en positief. Puur voor op de wedstrijdkaart.
INSTAGRAM: 3–5 korte zinnen. Warm en enthousiast. Vermeld de teamnaam "${fullTeamName}". Hashtags verplicht. Geen emoji's in de caption.
HEADLINE: 1 zin. Positief en simpel.`;

    const sys = stijl === "Jeugd & Plezier" ? sysJeugd : sysAdult;
    try {
      const d = await callClaudeAPI({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sys, messages:[{role:"user",content:`Genereer content:\n${JSON.stringify(md,null,2)}`}] });
      const raw=d.content?.map(b=>b.text||"").join("")||"";
      const parsed=parseJsonSafely(raw);
      if(!parsed.verslag||!parsed.samenvatting||!parsed.instagram||!parsed.headline) throw new Error();
      setAiOut(parsed);
      setLocked(true);
      archiveMatch(parsed);
    } catch { setAiErr("Mislukt. Controleer de data en probeer opnieuw."); }
    setLoading(false);
  };

  const dlImg = async () => {
    if(!instaRef.current) return; setDl(true);
    try {
      const h2c=await loadH2C();
      const cv=await h2c(instaRef.current,{backgroundColor:T.bg0,scale:3,useCORS:true,logging:false});
      const w=window.open();
      w.document.write(`<html><body style="margin:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;"><p style="color:#555;font-family:sans-serif;font-size:13px;">📱 Houd de afbeelding ingedrukt om op te slaan</p><img src="${cv.toDataURL("image/png")}" style="max-width:92vw;max-height:92vh;border-radius:16px;" /></body></html>`);
    } catch { alert("Mislukt."); }
    setDl(false);
  };

  const handleLogo    = e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setLogo(ev.target.result);r.readAsDataURL(f);};
  // Compress image to max 240px, jpeg quality 0.82 — voorkomt opzwellen localStorage
  const compressImage = (file) => new Promise((res) => {
    const r = new FileReader();
    r.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const max = 240;
        let { width, height } = img;
        if (width > height) { if (width > max) { height = height * max / width; width = max; } }
        else { if (height > max) { width = width * max / height; height = max; } }
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        res(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => res(ev.target.result); // fallback origineel
      img.src = ev.target.result;
    };
    r.readAsDataURL(file);
  });

  const handleSponsor = e => {
    Array.from(e.target.files).forEach(async (f) => {
      const url = await compressImage(f);
      setSponsors(p => [...p, { url, name: f.name }]);
    });
    e.target.value = "";
  };

  const handleMotmSponsorLogo = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const url = await compressImage(f);
    setMotmSponsor(prev => ({ ...prev, url }));
    e.target.value = "";
  };

  const handleTeamSponsorLogo = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const url = await compressImage(f);
    // Voegt nieuwe teamsponsor toe met de bestandsnaam als startwaarde voor de naam
    const cleanName = f.name.replace(/\.[^/.]+$/, ""); // strip extensie
    setTeamSponsors(prev => [...prev, { name: cleanName, url }]);
    e.target.value = "";
  };
  const handleSilverSponsorLogo = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const url = await compressImage(f);
    const cleanName = f.name.replace(/\.[^/.]+$/, "");
    setSilverSponsors(prev => prev.length>=4 ? prev : [...prev, { name: cleanName, url }]);
    e.target.value = "";
  };

  // ── Vision / PDF AI helpers ──
  const [scanning, setScanning] = useState(null); // "sponsor" | "players" | "nextmatch" | null
  const [scanError, setScanError] = useState(null);

  const fileToBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  // Verkleint + her-codeert een afbeelding naar geldige JPEG vóór verzending.
  // Lost de API 400/500 op: directe cameraderfoto's zijn te groot, en exotische
  // types (heic / lege type) worden door de Vision-API geweigerd. Canvas dwingt
  // altijd image/jpeg af op max 1568px lange zijde.
  const imageToJpegBase64 = (file, maxEdge = 1568, quality = 0.85) =>
    new Promise((res, rej) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (!width || !height) { rej(new Error("Kon afbeelding niet lezen")); return; }
        const scale = Math.min(1, maxEdge / Math.max(width, height));
        width  = Math.round(width  * scale);
        height = Math.round(height * scale);
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        try {
          res(c.toDataURL("image/jpeg", quality).split(",")[1]);
        } catch (e) { rej(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Bestandstype niet ondersteund — probeer een JPG of PNG")); };
      img.src = url;
    });

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Robuuste JSON parse: probeer strikt, val terug op regex-extractie
  const parseJsonSafely = (raw) => {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      // Fallback: zoek naar { ... } in de tekst
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) {
        try { return JSON.parse(m[0]); } catch {}
      }
      // Laatste redmiddel: leeg object
      return {};
    }
  };

  // API call met retry (exponential backoff: 0, 500, 2000ms)
  const callClaudeAPI = async (payload) => {
    if (!aiConsent) {
      throw new Error("AI-functies staan uit. Zet in Club instellingen 'AI-toestemming' aan om door te gaan.");
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("Geen internetverbinding");
    }
    const delays = [0, 500, 2000];
    let lastErr;
    for (const d of delays) {
      if (d > 0) await sleep(d);
      try {
        const res = await fetch("/.netlify/functions/anthropic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.status === 429 || res.status >= 500) {
          lastErr = new Error(`API ${res.status}, opnieuw proberen…`);
          continue;
        }
        if (!res.ok) {
          let detail = "";
          try { const j = await res.json(); detail = j?.error?.message || ""; }
          catch { try { detail = await res.text(); } catch {} }
          throw new Error(`API ${res.status}${detail ? " — " + detail.slice(0, 160) : ""}`);
        }
        return await res.json();
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("API call mislukt");
  };

  // Generieke Vision/PDF scan helper
  const scanWithVision = async (file, prompt) => {
    const isPdf = file.type === "application/pdf";
    const isImg = file.type.startsWith("image/") || file.type === "";
    if (!isPdf && !isImg) throw new Error("Alleen PDF of afbeelding ondersteund");
    let source;
    if (isPdf) {
      const b64 = await fileToBase64(file);
      source = { type: "base64", media_type: "application/pdf", data: b64 };
    } else {
      // Altijd verkleinen + her-coderen naar JPEG: voorkomt te grote payloads
      // (directe foto's) en ongeldige media_types (heic / leeg).
      const b64 = await imageToJpegBase64(file);
      source = { type: "base64", media_type: "image/jpeg", data: b64 };
    }
    const content = [
      { type: isPdf ? "document" : "image", source },
      { type: "text", text: prompt }
    ];
    const d = await callClaudeAPI({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content }]
    });
    const raw = d.content?.map(b => b.text || "").join("") || "";
    return parseJsonSafely(raw);
  };

  // Wrapper voor scan met UI feedback + undo
  const [lastScanUndo, setLastScanUndo] = useState(null);
  const runScan = async (mode, file, prompt, onResult) => {
    setScanning(mode); setScanError(null);
    try {
      const out = await scanWithVision(file, prompt);
      const undo = onResult(out);
      if (undo) setLastScanUndo({ mode, fn: undo });
    } catch (err) {
      setScanError("Scan mislukt: " + err.message);
    }
    setScanning(null);
  };

  // Scan sponsorposter
  const scanSponsors = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    await runScan("sponsor", file,
      `Bekijk deze afbeelding van een sponsorposter of sponsorbord. Geef ALLE zichtbare sponsorbedrijven terug. Geef ALLEEN dit JSON terug: {"sponsors":["Naam1","Naam2",...]}. Verzin geen namen, gebruik alleen wat zichtbaar is.`,
      (out) => {
        const before = sponsors;
        const newSp = (out.sponsors || []).map(n => ({ name: n, url: null }));
        if (newSp.length === 0) { setScanError("Geen sponsors herkend in de afbeelding"); return null; }
        setSponsors(p => [...p, ...newSp]);
        return () => setSponsors(before);
      }
    );
    e.target.value = "";
  };

  // Scan spelerslijst
  const scanPlayers = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    await runScan("players", file,
      `Bekijk dit document/foto van een spelerslijst. Geef ALLE spelersnamen terug. Geef ALLEEN dit JSON terug: {"players":["Voornaam Achternaam",...]}. Alleen spelersnamen, geen coaches/staf. Verzin geen namen.`,
      (out) => {
        const before = squad;
        const newPlayers = (out.players || []).filter(p => !squad.includes(p));
        if (newPlayers.length === 0) { setScanError("Geen nieuwe spelers herkend"); return null; }
        setSquad(p => [...p, ...newPlayers]);
        return () => setSquad(before);
      }
    );
    e.target.value = "";
  };

  // Scan volgende wedstrijd
  const scanNextMatch = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    await runScan("nextmatch", file,
      `Bekijk dit document of foto. Vind de informatie over de volgende wedstrijd van ${fullTeamName}. Geef ALLEEN dit JSON terug: {"date":"Zo 25 mei","time":"14:00","opponent":"FC Rivieren","location":"Thuis of Uit"}. Vul wat je kunt vinden, gebruik null voor ontbrekende velden.`,
      (out) => {
        const before = nextGame;
        const parts = [out.date, out.time, out.location, out.opponent ? "vs " + out.opponent : null].filter(Boolean);
        if (parts.length === 0) { setScanError("Geen wedstrijdinfo herkend"); return null; }
        setNextGame(parts.join(" | "));
        return () => setNextGame(before);
      }
    );
    e.target.value = "";
  };

  // Voetbal.nl URL fetch (met CORS proxy fallback)
  const [voetbalUrl, setVoetbalUrl] = useState("");
  const [voetbalFallback, setVoetbalFallback] = useState("");
  const fetchVoetbalNl = async () => {
    if (!voetbalUrl) return;
    setScanning("nextmatch"); setScanError(null);
    try {
      if (!navigator.onLine) throw new Error("Geen internetverbinding");
      let html;
      try {
        const r = await fetch(voetbalUrl);
        html = await r.text();
      } catch {
        throw new Error("Kan voetbal.nl niet direct ophalen. Kopieer de tekst van de pagina in het tekstveld hieronder.");
      }
      const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 5000);
      const d = await callClaudeAPI({
        model: "claude-sonnet-4-20250514", max_tokens: 500,
        messages: [{ role: "user", content: `Vind in deze voetbal.nl tekst de eerstvolgende wedstrijd. Geef ALLEEN dit JSON: {"date":"Zo 25 mei","time":"14:00","opponent":"...","location":"Thuis|Uit"}\n\n${text}` }]
      });
      const raw = d.content?.map(b => b.text || "").join("") || "";
      const out = parseJsonSafely(raw);
      const before = nextGame;
      const parts = [out.date, out.time, out.location, out.opponent ? "vs " + out.opponent : null].filter(Boolean);
      if (parts.length === 0) throw new Error("Geen wedstrijdinfo gevonden");
      setNextGame(parts.join(" | "));
      setLastScanUndo({ mode: "nextmatch", fn: () => setNextGame(before) });
    } catch (err) {
      setScanError(err.message);
    }
    setScanning(null);
  };
  const addP = ()=>{if(newP.trim()){setSquad([...squad,newP.trim()]);setNewP("");}};

  const gCount=events.filter(e=>e.type==="GOAL").length;
  const oCount=events.filter(e=>e.type==="OWN").length;
  const yCount=events.filter(e=>e.type==="YELLOW").length;
  const rCount=events.filter(e=>e.type==="RED").length;
  const sCount=events.filter(e=>e.type==="SUB").length;

  // Story schaalfunctie
  const storyCalcScale = (n) => n<=0?1.1:Math.max(0.62,Math.min(1.15,4/n));

  // Gecombineerde tijdlijn voor story (goals+kaarten+wissels)
  const storyTimeline = (()=>{
    let hs=0,as=0;
    const ge=events.filter(e=>e.type==="GOAL"||e.type==="OWN").map(g=>{
      if(g.type==="OWN")as++;else hs++;
      return {minute:parseInt(g.minute)||0,icon:"\u26bd",label:g.type==="OWN"?(opponent||"Teg."):g.player||"\u2014",sub:hs+"-"+as,isGoal:true,hs,as};
    });
    const ce=events.filter(e=>e.type==="YELLOW"||e.type==="RED").map(c=>({minute:parseInt(c.minute)||0,icon:c.type==="YELLOW"?"\ud83d\udfe8":"\ud83d\udfe5",label:c.player||"\u2014",sub:c.type==="YELLOW"?"Gele kaart":"Rode kaart",isGoal:false}));
    const se=events.filter(e=>e.type==="SUB").map(s=>({minute:parseInt(s.minute)||0,icon:"\ud83d\udd04",label:s.playerIn||"\u2014",sub:"\u2191 \u00b7 "+(s.playerOut||"\u2014")+" eraf",isGoal:false}));
    return [...ge,...ce,...se].sort((a,b)=>a.minute-b.minute);
  })();

  // ── Thema helpers ──
  const theme = THEMES.find(t => t.id === chosenTheme) || THEMES[0];
  const TAC  = theme.ac;
  const TAC2 = theme.ac2 || theme.ac;
  const TBG  = theme.bg;
  const thex = (col, a) => col + Math.round(a * 255).toString(16).padStart(2, "0");
  // Verdonker hex kleur met factor (0=zwart, 1=origineel)
  const darken = (hex, f=0.55) => {
    const r = Math.round(parseInt(hex.slice(1,3),16)*f);
    const g = Math.round(parseInt(hex.slice(3,5),16)*f);
    const b = Math.round(parseInt(hex.slice(5,7),16)*f);
    return `rgb(${r},${g},${b})`;
  };
  // Themabalk gradient — zichtbaar ook bij single-color themas
  const themeBarGradient = `linear-gradient(135deg, ${darken(TAC,0.5)} 0%, ${TAC} 40%, ${TAC2||TAC} 60%, ${darken(TAC2||TAC,0.5)} 100%)`;

  // Renders alle 4 patroon-varianten — herbruikbaar in elke post
  // ══════════════════════════════════════════════════════
  //  CARD_BACKGROUNDS REGISTER
  //  Voeg nieuwe achtergronden toe als een nieuw object.
  //  Aanroep: renderBackground(opacityMul)
  //  Toekomstige types: "photo", "grass", "stadium", "noise", etc.
  // ══════════════════════════════════════════════════════
  const CARD_BACKGROUNDS = {

    // 1. Carbon Diagonaal — schuine streepjes in themakleur
    carbon: (mul=1) => (
      <>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
          {Array.from({length:18}).map((_,i)=>(
            <div key={i} style={{position:"absolute",top:0,bottom:0,left:`${(i/18)*145-25}%`,width:`${0.5+(i%3)*0.45}%`,background:i>9?TAC2:TAC,opacity:0.1*mul*(i%2===0?1:0.4),transform:"skewX(-16deg)"}}/>
          ))}
        </div>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 2. Dual — carbon + kleurgradiënt tweede accent
    dual: (mul=1) => (
      <>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
          {Array.from({length:18}).map((_,i)=>(
            <div key={i} style={{position:"absolute",top:0,bottom:0,left:`${(i/18)*145-25}%`,width:`${0.5+(i%3)*0.45}%`,background:i>9?TAC2:TAC,opacity:0.1*mul*(i%2===0?1:0.4),transform:"skewX(-16deg)"}}/>
          ))}
          <div style={{position:"absolute",inset:0,background:`linear-gradient(150deg,${thex(TAC,0.1*mul)} 0%,transparent 50%,${thex(TAC2,0.08*mul)} 100%)`}}/>
        </div>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 3. Pijlen — V-vormen in themakleur
    arrows: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400" preserveAspectRatio="none">
          <defs><linearGradient id={`ab-${theme.id}`} x1="0.5" y1="0" x2="0.5" y2="1"><stop offset="0%" stopColor={TAC} stopOpacity={0.1*mul}/><stop offset="100%" stopColor={TAC} stopOpacity="0"/></linearGradient></defs>
          <ellipse cx="200" cy="155" rx="200" ry="180" fill={`url(#ab-${theme.id})`}/>
          {[[30,160,0.07],[90,200,0.05],[160,240,0.07],[240,200,0.05],[310,160,0.06]].map(([x,h,op],i)=>(
            <polyline key={i} points={`${x},${200-h/2} ${x+h*0.4},200 ${x},${200+h/2}`} fill="none" stroke={TAC} strokeWidth={i===2?"2.5":"1.2"} opacity={op*mul}/>
          ))}
        </svg>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 4. Grid — fijn rasterpatroon
    grid: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400">
          <defs>
            <pattern id={`gp-${theme.id}`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke={TAC} strokeWidth="0.4" opacity={0.22*mul}/></pattern>
            <linearGradient id={`gf-${theme.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" stopOpacity="0.85"/><stop offset="100%" stopColor="black" stopOpacity="0.15"/></linearGradient>
            <mask id={`gm-${theme.id}`}><rect width="400" height="400" fill={`url(#gf-${theme.id})`}/></mask>
          </defs>
          <rect width="400" height="400" fill={`url(#gp-${theme.id})`} mask={`url(#gm-${theme.id})`}/>
        </svg>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 5. Plain — alleen radiale gloed, geen patroon
    plain: (mul=1) => (
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.15*mul)} 0%,transparent 65%)`,pointerEvents:"none"}}/>
    ),

    // 6. Chevron — horizontale V-strepen
    chevron: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400" preserveAspectRatio="none">
          {Array.from({length:10}).map((_,i)=>(
            <polyline key={i} points={`0,${30+i*42} 200,${5+i*42} 400,${30+i*42}`} fill="none" stroke={TAC} strokeWidth={i%2===0?"2.2":"1.2"} opacity={(0.08-i*0.004)*mul}/>
          ))}
        </svg>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 7. Stadium — silhouet van stadiondaken onderaan
    stadium: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400" preserveAspectRatio="none">
          <path d={`M 0 340 Q 60 295 130 320 T 270 305 T 400 335 L 400 400 L 0 400 Z`} fill={TAC} opacity={0.12*mul}/>
          <path d={`M 0 360 Q 80 325 170 345 T 320 335 T 400 358 L 400 400 L 0 400 Z`} fill={TAC2||TAC} opacity={0.08*mul}/>
          {Array.from({length:24}).map((_,i)=>(
            <line key={i} x1={i*17+8} y1="370" x2={i*17+8} y2="400" stroke={TAC} strokeWidth="1.2" opacity={0.15*mul}/>
          ))}
        </svg>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 8. Grass — verticale grasstrepen onderaan
    grass: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400" preserveAspectRatio="none">
          <rect x="0" y="280" width="400" height="120" fill={TAC} opacity={0.04*mul}/>
          {Array.from({length:50}).map((_,i)=>(
            <line key={i} x1={i*8+2} y1={300+(i%4)*5} x2={i*8+2} y2="400" stroke={TAC} strokeWidth={i%5===0?"1.4":"0.8"} opacity={(0.08+(i%3)*0.03)*mul}/>
          ))}
        </svg>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 9. Rays — stralen vanaf het midden
    rays: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id={`rg-${theme.id}`}><stop offset="0%" stopColor={TAC} stopOpacity={0.18*mul}/><stop offset="100%" stopColor={TAC} stopOpacity="0"/></radialGradient>
          </defs>
          {Array.from({length:14}).map((_,i)=>{
            const ang=(i/14)*360, rad=(ang-90)*Math.PI/180;
            const x2=200+Math.cos(rad)*450, y2=200+Math.sin(rad)*450;
            return <line key={i} x1="200" y1="200" x2={x2} y2={y2} stroke={TAC} strokeWidth={i%2?"1":"2.2"} opacity={(0.06+(i%2)*0.02)*mul}/>;
          })}
          <circle cx="200" cy="200" r="180" fill={`url(#rg-${theme.id})`}/>
        </svg>
      </>
    ),

    // 10. Dots — halftone puntenpatroon dat naar boven fade't
    dots: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400">
          <defs>
            <pattern id={`dp-${theme.id}`} width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.4" fill={TAC} opacity={0.5*mul}/></pattern>
            <linearGradient id={`df-${theme.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" stopOpacity="0.92"/><stop offset="100%" stopColor="black" stopOpacity="0.15"/></linearGradient>
            <mask id={`dm-${theme.id}`}><rect width="400" height="400" fill={`url(#df-${theme.id})`}/></mask>
          </defs>
          <rect width="400" height="400" fill={`url(#dp-${theme.id})`} mask={`url(#dm-${theme.id})`}/>
        </svg>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 11. Hex — hexagonaal mesh
    hex: (mul=1) => (
      <>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 400">
          <defs>
            <pattern id={`hp-${theme.id}`} width="36" height="32" patternUnits="userSpaceOnUse">
              <polygon points="18,4 32,12 32,27 18,35 4,27 4,12" fill="none" stroke={TAC} strokeWidth="0.7" opacity={0.22*mul}/>
            </pattern>
            <linearGradient id={`hf-${theme.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="black" stopOpacity="0.88"/><stop offset="100%" stopColor="black" stopOpacity="0.2"/></linearGradient>
            <mask id={`hm-${theme.id}`}><rect width="400" height="400" fill={`url(#hf-${theme.id})`}/></mask>
          </defs>
          <rect width="400" height="400" fill={`url(#hp-${theme.id})`} mask={`url(#hm-${theme.id})`}/>
        </svg>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 38%,${thex(TAC,0.1*mul)} 0%,transparent 62%)`,pointerEvents:"none"}}/>
      </>
    ),

    // 12. Cinematic — mist + glow + comet streaks + halftone hoeken
    //     Twee kleurzones: TAC bovenaan (mist), TAC2 rechtsonder (bal-glow)
    cinematic: (mul=1) => (
      <>
        {/* Bovenste kleurmist (TAC) */}
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 85% 55% at 30% 22%,${thex(TAC,0.5*mul)} 0%,${thex(TAC,0.18*mul)} 32%,transparent 65%)`,pointerEvents:"none"}}/>
        {/* Bal-gloed rechtsonder (TAC2 of TAC) */}
        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle 38% at 68% 62%,${thex(TAC2||TAC,0.62*mul)} 0%,${thex(TAC2||TAC,0.22*mul)} 22%,transparent 46%)`,pointerEvents:"none"}}/>
        {/* Diagonale mistband midden */}
        <div style={{position:"absolute",inset:0,background:`linear-gradient(160deg,transparent 28%,${thex(TAC,0.08*mul)} 50%,${thex(TAC2||TAC,0.07*mul)} 65%,transparent 82%)`,pointerEvents:"none"}}/>
        {/* Vignette */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 45%,transparent 30%,rgba(0,0,0,0.45) 100%)",pointerEvents:"none"}}/>

        {/* SVG: halftone dots in hoeken + comet streaks */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id={`cdp-${theme.id}`} width="9" height="9" patternUnits="userSpaceOnUse">
              <circle cx="4.5" cy="4.5" r="1.15" fill="#fff" opacity={0.55*mul}/>
            </pattern>
            <radialGradient id={`ctl-${theme.id}`} cx="8%" cy="6%" r="32%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id={`cbr-${theme.id}`} cx="92%" cy="92%" r="32%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.7"/>
              <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
            </radialGradient>
            <mask id={`ctlm-${theme.id}`}><rect width="400" height="600" fill={`url(#ctl-${theme.id})`}/></mask>
            <mask id={`cbrm-${theme.id}`}><rect width="400" height="600" fill={`url(#cbr-${theme.id})`}/></mask>
          </defs>
          {/* Halftone clusters */}
          <rect width="400" height="600" fill={`url(#cdp-${theme.id})`} mask={`url(#ctlm-${theme.id})`}/>
          <rect width="400" height="600" fill={`url(#cdp-${theme.id})`} mask={`url(#cbrm-${theme.id})`}/>
          {/* Comet streaks - diagonale lichtstrepen */}
          {Array.from({length:14}).map((_,i)=>{
            const x1=-30+i*36, y1=i*14-30, x2=x1+115, y2=y1+205;
            const isAccent = i%4===0;
            return <line key={`s-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={isAccent?(i%8===0?TAC2||TAC:TAC):"#fff"} strokeWidth={isAccent?"1.6":"0.55"} opacity={(0.14+(i%3)*0.06)*mul} strokeLinecap="round"/>;
          })}
        </svg>
      </>
    ),

    // 13. Photo — sfeer-afbeelding behoudt verhouding (ronde bal) + lichte zoom
    photo: (mul=1) => (
      <>
        {/* Donkere basis — voorkomt grijze bleed bij hoeken */}
        <div style={{position:"absolute",inset:0,background:TBG,pointerEvents:"none"}}/>
        {theme.bgImage && (
          <div style={{
            position:"absolute",
            inset:0,
            backgroundImage:`url(${theme.bgImage})`,
            backgroundSize:"cover",           /* behoudt aspect ratio — geen distortie */
            backgroundPosition:"center center",
            backgroundRepeat:"no-repeat",
            transform:"scale(1.08)",          /* proportionele inzoom om donkere randen weg te crop'en */
            transformOrigin:"center center",
            opacity:mul,
            pointerEvents:"none",
          }}/>
        )}
      </>
    ),
  };

  // Selecteer achtergrond op basis van het thema
  const renderBackground = (mul=1) => {
    const bg = CARD_BACKGROUNDS[theme.pattern] || CARD_BACKGROUNDS.carbon;
    return bg(mul);
  };

  // Alias voor achterwaartse compatibiliteit
  const renderPattern = renderBackground;
  // Helper: opponent logo display for visual cards
  const OppLogoCell = ({size="18%", style={}}) => oppLogoUrl
    ? <img src={oppLogoUrl} style={{width:size,aspectRatio:"1/1",objectFit:"contain",background:"#fff",borderRadius:"12%",padding:"1.5%",...style}} crossOrigin="anonymous" />
    : <div style={{width:size,aspectRatio:"1/1",background:"rgba(255,255,255,0.08)",borderRadius:"12%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7%",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.1)",...style}}>👕</div>;

  // ── SPLASH SCREEN ──
  if (!appReady) return (
    <div style={{
      position:"fixed",inset:0,
      background:"#0a0a0d",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      gap:24,
      animation:"splashFadeIn 0.4s ease"
    }}>
      <style>{`@keyframes splashFadeIn{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}} @keyframes dotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
      <img src={MATCHLY_LOGO} alt="Matchly" style={{width:100,height:100,objectFit:"contain",borderRadius:22}}/>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,letterSpacing:"0.25em",color:"rgba(255,255,255,0.35)",textTransform:"uppercase"}}>Van wedstrijd. Naar content.</div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:8,height:8,borderRadius:"50%",background:U,animation:`dotBounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:Barlow,sans-serif;background:${T.bg0};}
        ::-webkit-scrollbar{width:0}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.8)}}
        @keyframes splashFadeIn{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes splashFadeOut{0%{opacity:1}100%{opacity:0;pointer-events:none}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes pulsePause{0%,100%{box-shadow:0 6px 20px rgba(168,85,247,0.35), 0 0 0 0 rgba(168,85,247,0.55)}50%{box-shadow:0 6px 28px rgba(168,85,247,0.65), 0 0 0 8px rgba(168,85,247,0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes trophySpin{0%{transform:rotateY(0deg)}50%{transform:rotateY(180deg)}100%{transform:rotateY(360deg)}}
        @keyframes trophyGlow{0%,100%{box-shadow:0 0 40cqw rgba(255,255,255,0.4),0 0 20cqw rgba(255,255,255,0.2)}50%{box-shadow:0 0 60cqw rgba(255,255,255,0.6),0 0 30cqw rgba(255,255,255,0.35)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        select,input,textarea{-webkit-appearance:none;appearance:none;}
        select option{background:${T.bg2};}
        button:active{opacity:0.82;transform:scale(0.975);}
      `}</style>

      <div style={{background:T.bg0,height:"100dvh",display:"flex",justifyContent:"center",overflow:"hidden"}}>
        <div style={{width:"100%",maxWidth:430,background:T.bg1,height:"100dvh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* HEADER */}
          <MatchHeader clubName={clubName} opponent={opponent} homeScore={home} awayScore={away} status={status} elapsed={elapsed} paused={paused} clubLogo={logo} hvLogoUrl={hvLogoUrl} oppLogoUrl={oppLogoUrl} C={C} sec={sec} setElapsed={setElapsed} adjustTime={adjustTime} />

          {/* Offline banner - global */}
          {!isOnline && (
            <div style={{
              background:"linear-gradient(135deg,#f59e0b,#d97706)",
              borderRadius:12,
              padding:"10px 14px",
              marginBottom:14,
              display:"flex",
              alignItems:"center",
              gap:10
            }}>
              <span style={{fontSize:20}}>📵</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:"\'Barlow Condensed\',sans-serif",fontWeight:900,fontSize:13,color:"#000",letterSpacing:0.8,textTransform:"uppercase"}}>Offline modus</div>
                <div style={{fontSize:11,color:"rgba(0,0,0,0.78)",fontFamily:"Barlow,sans-serif",lineHeight:1.4,marginTop:2}}>Wedstrijd registreren werkt volledig — alleen AI-content + logo-zoek wachten tot internet weer beschikbaar is.</div>
              </div>
            </div>
          )}

          {/* NAV */}
          <div style={{background:T.bg0,borderBottom:`1px solid ${T.border}`,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            {screen!=="dashboard"
              ? <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <button onClick={()=>setScreen("dashboard")} style={{background:"none",border:"none",color:T.text3,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:700,letterSpacing:0.5,display:"flex",alignItems:"center",gap:6,padding:0}}>
                    <span style={{fontSize:20,lineHeight:1,fontWeight:300}}>‹</span> Dashboard
                  </button>
                  {(screen==="overzicht" || (screen==="club" && clubSection!=="main")) && (
                    <button onClick={()=> (screen==="club" ? setClubSection("main") : goBack())} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border2}`,color:T.text3,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,letterSpacing:0.5,display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:100}}>
                      <span style={{fontSize:15,lineHeight:1}}>↩</span> Terug
                    </button>
                  )}
                </div>
              : <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <img src={MATCHLY_LOGO} alt="Matchly" style={{height:32,width:"auto",display:"block",objectFit:"contain"}}/>
                </div>
            }
            <button onClick={()=>{setScreen(screen==="club"?"dashboard":"club");}} style={{width:38,height:38,background:screen==="club"?hex(U,0.15):"rgba(255,255,255,0.05)",border:`1px solid ${screen==="club"?hex(U,0.4):T.border2}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,transition:"all 0.18s",boxShadow:screen==="club"?`0 0 12px ${hex(U,0.25)}`:"none"}}>⚙️</button>
          </div>

          {/* CONTENT */}
          <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"20px 20px 40px",animation:"slideUp 0.22s ease"}}>

            {/* ══════════════════════════
                DASHBOARD
            ══════════════════════════ */}
            {screen==="dashboard" && (<>
              {status==="PRE" && (
                <div style={{animation:"slideUp 0.3s ease"}}>
                  {hasStarted && (
                    <button onClick={()=>setStatus("LIVE")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:0.5,padding:"0 0 14px 0",textTransform:"uppercase"}}>
                      <span style={{fontSize:15,lineHeight:1}}>←</span> Terug naar dashboard
                    </button>
                  )}

                  {!hasStarted && squad.length===0 && events.length===0 && !aiOut && (
                    <div style={{textAlign:"center",padding:"24px 8px 8px"}}>
                      <span style={{fontSize:36,lineHeight:1,display:"inline-block",marginBottom:10}}>👋</span>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:T.text,letterSpacing:0.5,marginBottom:6}}>Klaar om te beginnen?</div>
                      <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,maxWidth:280,margin:"0 auto 14px"}}>
                        {teamId ? "Wedstrijd staat klaar — voer de tegenstander in en start." : <>Begin met instellen via <span style={{color:U,fontWeight:700}}>⚙️ Club-instellingen</span> rechtsboven.</>}
                      </div>
                    </div>
                  )}

                  {/* ── NEXT MATCH HUB ── altijd zichtbaar in PRE status ── */}
                  {true && (
                    <div style={{background:`linear-gradient(135deg,${hex(U,0.1)},${hex(U,0.04)})`,border:`1px solid ${hex(U,0.25)}`,borderRadius:18,padding:18,marginBottom:18,position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${U},${hex(U,0.3)})`}}/>
                      {/* TOP — datum + tijd prominent, sub-label eronder */}
                      <div style={{textAlign:"center",marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${T.border3}`}}>
                        {(matchDate || kick) ? (
                          <div style={{fontSize:18,fontWeight:900,color:T.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textTransform:"uppercase",lineHeight:1.1,marginBottom:6}}>
                            {matchDate && (()=>{try{return new Date(matchDate).toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long"});}catch(e){return matchDate;}})()}
                            {matchDate && kick && <span style={{color:U,margin:"0 8px"}}>·</span>}
                            {kick && <span style={{color:U}}>{kick}</span>}
                          </div>
                        ) : (
                          <div style={{fontSize:18,fontWeight:900,color:T.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textTransform:"uppercase",lineHeight:1.1,marginBottom:6}}>
                            {new Date().toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long"})}
                            <span style={{color:U,margin:"0 8px"}}>·</span>
                            <span style={{color:U}}>{new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})}</span>
                          </div>
                        )}
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                          <span style={{fontSize:9,fontWeight:900,letterSpacing:2.5,color:U,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif"}}>Eerstvolgende wedstrijd</span>
                          <span style={{color:T.text4,fontSize:9}}>·</span>
                          <span style={{fontSize:9,fontWeight:800,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,textTransform:"uppercase"}}>{loc==="thuis"?"🏠 Thuis":"✈️ Uit"}</span>
                        </div>
                      </div>

                      {/* AUTO-OPHAAL knop — bovenaan, prominent */}
                      <button onClick={fetchNextMatch} disabled={nextMatchLoading} style={{width:"100%",marginBottom:nextMatchMsg?6:14,padding:"12px",background:nextMatchLoading?"rgba(255,255,255,0.04)":M.gradD,border:"none",borderRadius:100,color:nextMatchLoading?T.text4:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,letterSpacing:0.5,cursor:nextMatchLoading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:nextMatchLoading?"none":`0 4px 16px ${hex(M.purple,0.35)}`}}>
                        {nextMatchLoading
                          ? <><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span> Opzoeken…</>
                          : <>🔄 Laad komende wedstrijd</>
                        }
                      </button>
                      {nextMatchMsg && (
                        <div style={{fontSize:11,color:nextMatchMsg.startsWith("✓")?U:T.text4,fontFamily:"Barlow,sans-serif",textAlign:"center",marginBottom:14,padding:"6px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8}}>{nextMatchMsg}</div>
                      )}

                      {/* GELADEN STATE — als opponent is ingevuld én niet aan het bewerken */}
                      {(opponent && !editingMatch) ? (
                        <>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:14}}>
                            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                              {(logo||hvLogoUrl)
                                ?<img src={logo||hvLogoUrl} style={{width:48,height:48,objectFit:"contain",background:"#fff",borderRadius:10,padding:4}} crossOrigin="anonymous"/>
                                :<div style={{width:48,height:48,background:hex(U,0.2),borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:U,fontFamily:"'Barlow Condensed',sans-serif"}}>{clubName.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>
                              }
                              <span style={{fontSize:11,fontWeight:700,color:T.text2,textAlign:"center",lineHeight:1.2,fontFamily:"Barlow,sans-serif"}}>{clubName}</span>
                            </div>
                            <div style={{fontSize:22,fontWeight:900,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2}}>VS</div>
                            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                              {oppLogoUrl
                                ?<img src={oppLogoUrl} style={{width:48,height:48,objectFit:"contain",background:"#fff",borderRadius:10,padding:4}} crossOrigin="anonymous"/>
                                :<div style={{width:48,height:48,background:"rgba(255,255,255,0.08)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif"}}>{opponent.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>
                              }
                              <span style={{fontSize:11,fontWeight:700,color:T.text2,textAlign:"center",lineHeight:1.2,fontFamily:"Barlow,sans-serif"}}>{opponent}</span>
                            </div>
                          </div>

                          {/* Info bar */}
                          <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
{weather && <div style={{flex:"1 1 auto",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border2}`,borderRadius:10,padding:"7px 10px",display:"flex",alignItems:"center",gap:6,fontSize:11,color:T.text3,fontFamily:"Barlow,sans-serif"}}><span>🌤️</span><span style={{fontWeight:700}}>{weather}</span></div>}
                            {mKind && <div style={{flex:"1 1 auto",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border2}`,borderRadius:10,padding:"7px 10px",display:"flex",alignItems:"center",gap:6,fontSize:11,color:T.text3,fontFamily:"Barlow,sans-serif"}}><span>🏆</span><span style={{fontWeight:700}}>{mKind}</span></div>}
                          </div>

                          {/* Bewerken / opnieuw ophalen / meldingen rij */}
                          <div style={{display:"flex",gap:6,marginBottom:12,justifyContent:"center",flexWrap:"wrap"}}>
                            <button onClick={()=>setEditingMatch(true)} style={{padding:"5px 10px",background:"transparent",border:`1px solid ${T.border3}`,borderRadius:8,color:T.text4,fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}}>✏️ Bewerken</button>
                            <button onClick={()=>{setOpp("");setOppLogoUrl("");setOppLogoMsg("");autoFetchedRef.current=false;fetchNextMatch();}} style={{padding:"5px 10px",background:"transparent",border:`1px solid ${T.border3}`,borderRadius:8,color:T.text4,fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}}>↻ Opnieuw ophalen</button>
                          </div>
                        </>
                      ) : (
                        /* LEGE STATE — clean form layout */
                        <>
                          <div style={{display:"flex",alignItems:"center",gap:10,margin:"6px 0 16px",color:T.text4}}>
                            <div style={{flex:1,height:1,background:T.border3}}/>
                            <span style={{fontSize:10,fontWeight:800,letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif",textTransform:"uppercase"}}>Of handmatig</span>
                            <div style={{flex:1,height:1,background:T.border3}}/>
                          </div>

                          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                            <input
                              value={oppDraft}
                              onChange={e=>setOppDraft(e.target.value)}
                              onBlur={()=>{
                                const v=oppDraft.trim();
                                if(v!==opponent){
                                  setOpp(v);
                                  if(v) setEditingMatch(true);   // blijf in formulier zodat datum/tijd nog invulbaar zijn
                                  if(oppLogoUrl)setOppLogoUrl("");
                                  if(oppLogoMsg)setOppLogoMsg("");
                                  if(v) triggerOppLogoSearch();
                                }
                              }}
                              onKeyDown={e=>{if(e.key==="Enter") e.target.blur();}}
                              placeholder="Naam tegenstander..."
                              style={{...INP,marginBottom:0}}
                            />
                            <div style={{display:"flex",gap:8}}>
                              <input type="date" value={matchDate} onChange={e=>setMatchDate(e.target.value)} style={{...INP,marginBottom:0,flex:1,colorScheme:"dark"}}/>
                              <input type="time" value={kick} onChange={e=>setKick(e.target.value)} placeholder="14:00" style={{...INP,marginBottom:0,flex:1,colorScheme:"dark"}}/>
                            </div>
                            <div style={{display:"flex",gap:8}}>
                              <Chip label="🏠 Thuis" active={loc==="thuis"} onClick={()=>setLoc("thuis")} color={U} />
                              <Chip label="✈️ Uit" active={loc==="uit"} onClick={()=>setLoc("uit")} color={U} />
                            </div>
                            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                              {["Competitie","Beker","Oefenwedstrijd"].map(t=><Chip key={t} label={t} active={mKind===t} onClick={()=>setMKind(mKind===t?"":t)} color={U} />)}
                            </div>
                            {editingMatch && opponent && (
                              <button onClick={()=>setEditingMatch(false)} style={{padding:"10px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:12,color:U,fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,letterSpacing:0.5,cursor:"pointer"}}>✓ Klaar met bewerken</button>
                            )}
                          </div>
                        </>
                      )}

                    </div>
                  )}

                  {/* ── MELDINGEN — eigen blok, altijd zichtbaar in PRE ── */}
                  {(()=>{
                    const supported = typeof Notification !== "undefined";
                    const perm = supported ? Notification.permission : "unsupported";
                    const isOn = perm === "granted";
                    const isBlocked = perm === "denied";
                    return (
                      <div style={{background:isOn?hex(U,0.08):"rgba(255,255,255,0.03)",border:`1px solid ${isOn?hex(U,0.25):T.border2}`,borderRadius:14,padding:14,marginBottom:18,display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:22,lineHeight:1}}>{isOn?"🔔":isBlocked?"🔕":"🔔"}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:900,color:isOn?U:T.text2,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,marginBottom:2}}>
                            {isOn ? "Meldingen aan" : isBlocked ? "Meldingen geblokkeerd" : !supported ? "Meldingen niet ondersteund" : "Meldingen uit"}
                          </div>
                          <div style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.4}}>
                            {isOn ? "5 min vóór aftrap + na elk spelbeeld-blok" : isBlocked ? "Sta meldingen toe via je browserinstellingen" : !supported ? "Deze browser ondersteunt geen meldingen" : "Krijg een ping 5 min vóór de wedstrijd"}
                          </div>
                        </div>
                        {!isOn && !isBlocked && supported && (
                          <button onClick={async()=>{
                            const r = await requestNotifyPermission();
                            if (r === "granted") {
                              setNextMatchMsg("🔔 Meldingen aan");
                              try { new Notification("✓ Meldingen aan", { body: "Je krijgt nu pushberichten." }); } catch(e) {}
                            } else if (r === "denied") {
                              setNextMatchMsg("⚠ Meldingen geblokkeerd — wijzig in browserinstellingen");
                            }
                          }} style={{padding:"9px 14px",background:U,border:"none",borderRadius:10,color:"#000",fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,letterSpacing:0.5,cursor:"pointer",flexShrink:0,textTransform:"uppercase"}}>
                            Aanzetten
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* ── BASISOPSTELLING — knop die de chips toont (punt 11) ── */}
                  <button onClick={()=>setShowBasis(s=>!s)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:`linear-gradient(135deg,${hex(U,0.1)},${hex(U,0.03)})`,border:`1px solid ${hex(U,0.22)}`,borderRadius:18,padding:"14px 16px",marginBottom:showBasis?0:18,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>
                    <span style={{fontSize:13,fontWeight:900,letterSpacing:1.5,color:U,textTransform:"uppercase"}}>⭐ Basisopstelling instellen</span>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:15,fontWeight:900,color:baseSquad.length===11?U:T.text2}}>{baseSquad.length}<span style={{fontSize:11,color:T.text4}}>/11</span></span>
                      <span style={{fontSize:12,color:U}}>{showBasis?"▲":"▼"}</span>
                    </span>
                  </button>
                  {showBasis && (
                    <div style={{background:`linear-gradient(135deg,${hex(U,0.06)},${hex(U,0.02)})`,border:`1px solid ${hex(U,0.18)}`,borderTop:"none",borderRadius:"0 0 18px 18px",padding:16,marginBottom:18}}>
                      <div style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:12}}>Tik op spelers om de basis te kiezen · rest is wissel · ook te beheren via spelersbeheer</div>
                      {/* Spelers grid — tap to toggle, of empty state als geen squad */}
                      {squad.length===0 ? (
                        <div style={{padding:"20px 12px",textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:12,border:`1px dashed ${T.border3}`}}>
                          <div style={{fontSize:28,marginBottom:8,opacity:0.6}}>👥</div>
                          <div style={{fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:10}}>
                            Voeg eerst je spelers toe om de basis te kunnen kiezen.
                          </div>
                          <button onClick={()=>setScreen("club")} style={{padding:"8px 14px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:10,color:U,fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,cursor:"pointer"}}>
                            👥 Naar spelersbeheer
                          </button>
                        </div>
                      ) : (
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {squad.map(p=>{
                          const isBase = baseSquad.includes(p);
                          const isFull = baseSquad.length>=11;
                          const disabled = !isBase && isFull;
                          return (
                            <button
                              key={p}
                              onClick={()=>{
                                if(isBase) setBaseSquad(prev=>prev.filter(n=>n!==p));
                                else if(!isFull) setBaseSquad(prev=>[...prev,p]);
                              }}
                              disabled={disabled}
                              style={{
                                padding:"7px 11px",
                                background:isBase?M.gradD:disabled?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.05)",
                                border:`1px solid ${isBase?"transparent":disabled?T.border3:T.border2}`,
                                borderRadius:20,
                                color:isBase?"#fff":disabled?T.text4:T.text2,
                                fontSize:12,
                                fontWeight:isBase?800:600,
                                fontFamily:"Barlow,sans-serif",
                                cursor:disabled?"not-allowed":"pointer",
                                opacity:disabled?0.4:1,
                                transition:"all 0.15s",
                                lineHeight:1.2,
                                boxShadow:isBase?`0 4px 14px ${hex(M.purple,0.35)}`:"none",
                              }}
                            >{p}</button>
                          );
                        })}
                      </div>
                      )}

                      {/* Voetnoot met basis vs wissel */}
                      {baseSquad.length>0 && (
                        <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${T.border3}`,display:"flex",justifyContent:"space-between",fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>
                          <span style={{color:U}}>⭐ Basis: {baseSquad.length}</span>
                          <span style={{color:T.text4}}>Wissel: {squad.length-baseSquad.length}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Weertype */}
                  <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",marginBottom:10,opacity:0.6}}>Weer</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:28}}>
                    {WEATHER.map(w=>(
                      <button
                        key={w.v}
                        onClick={()=>setWeather(weather===w.v?"":w.v)}
                        title={w.label}
                        style={{
                          padding:"14px 4px",
                          background:weather===w.v?hex(U,0.12):"rgba(255,255,255,0.04)",
                          border:`1px solid ${weather===w.v?U:T.border3}`,
                          borderRadius:14,
                          cursor:"pointer",
                          display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                          transition:"all 0.18s",
                          boxShadow:weather===w.v?`0 0 14px ${hex(U,0.25)}`:"none",
                          backdropFilter:"blur(8px)",
                        }}
                      >
                        <span style={{fontSize:22,lineHeight:1,filter:weather===w.v?"none":"grayscale(0.4)"}}>{w.icon}</span>
                        <span style={{fontSize:9,fontWeight:800,color:weather===w.v?U:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,textTransform:"uppercase",lineHeight:1,whiteSpace:"nowrap"}}>{w.label}</span>
                      </button>
                    ))}
                  </div>

                  <PBtn label={hasStarted?"Ga naar dashboard":"Wedstrijd starten"} icon={hasStarted?"⚡":"🚀"} onClick={hasStarted?()=>setStatus("LIVE"):startMatch} disabled={!hasStarted && !opponent} />
                </div>
              )}

              {status!=="PRE" && (<>
                <button onClick={()=>setStatus("PRE")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:0.5,padding:"0 0 14px 0",textTransform:"uppercase"}}>
                  <span style={{fontSize:15,lineHeight:1}}>←</span> Wedstrijd instellen
                </button>

                <button onClick={()=>setScreen("overzicht")} style={{width:"100%",padding:17,marginBottom:12,background:"transparent",border:`1px solid ${T.border3}`,borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:T.text3,cursor:"pointer",textTransform:"uppercase",letterSpacing:1.2,transition:"all 0.2s",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                  <span>📊</span> Overzicht {events.length>0 && <span style={{fontSize:13,fontWeight:700,color:T.text4}}>({events.length})</span>}
                </button>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <GCard icon={<div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#00e676,#00b248)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(0,230,118,0.4)"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="#000"/></svg></div>} label="Goals" sub={`${gCount} eigen · ${oCount} tegen`} count={gCount+oCount} onClick={()=>setScreen("goals")} accent={C} disabled={locked} />
                  <GCard icon={<div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#ffd600,#ff6f00)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(255,214,0,0.35)",position:"relative"}}><div style={{position:"absolute",width:18,height:24,background:"#ffd600",borderRadius:3,top:4,left:6,border:"1.5px solid rgba(0,0,0,0.2)"}}/><div style={{position:"absolute",width:18,height:24,background:"#ff1744",borderRadius:3,top:7,left:12,border:"1.5px solid rgba(0,0,0,0.2)"}}/></div>} label="Kaarten" sub={`${yCount} geel · ${rCount} rood`} count={yCount+rCount} onClick={()=>setScreen("kaarten")} accent={U} disabled={locked} />
                  <GCard icon={<div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#448aff,#1565c0)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(68,138,255,0.35)"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h13M13 4l3 3-3 3M21 17H8M11 14l-3 3 3 3"/></svg></div>} label="Wissels" sub={`${sCount} doorgevoerd`} count={sCount} onClick={()=>setScreen("wissels")} accent={C} disabled={locked} />
                  <GCard icon={<div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${U},${hex(U,0.6)})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 14px ${hex(U,0.4)}`}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div>} label="Spelbeeld" sub="Wedstrijdanalyse" onClick={()=>setScreen("spelbeeld")} accent={U} disabled={locked} progress={[h1f1,h1f2,h1f3,h2f1,h2f2,h2f3,algBeld].filter(Boolean).length} progressMax={7} />
                  <GCard icon={<div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#ffd600,#ff8f00)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(255,214,0,0.35)"}}>🏆</div>} label="Man of the Match" sub={home<away?"Niet bij verlies":(motm?motm:"Kies speler")} onClick={()=>setScreen("uitblinkers")} accent={U} disabled={locked} />
                  <GCard icon={<div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(124,58,237,0.45)",fontSize:20}}>⚡</div>} label="Wedstrijdmomenten" labelSize={14} sub={keyMoments.length+specialInfo.length>0?`${keyMoments.length+specialInfo.length} momenten`:"Kansen, blessures & meer"} count={keyMoments.length+specialInfo.length} onClick={()=>setScreen("wedstrijdinfo")} accent={"#7c3aed"} disabled={locked} />
                </div>

                {status==="LIVE" && (
                  <button onClick={togglePause} style={{width:"100%",padding:14,background:paused?M.gradD:"transparent",border:paused?"none":`1px solid ${hex(U,0.4)}`,borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,color:paused?"#fff":U,cursor:"pointer",textTransform:"uppercase",letterSpacing:1.2,marginBottom:10,boxShadow:paused?`0 8px 28px ${hex(M.purple,0.4)}`:"none",animation:paused?"pulsePause 1.6s ease-in-out infinite":"none"}}>
                    {paused?"▶️ Wedstrijdtijd hervatten":"⏸️ Wedstrijdtijd pauzeren (rust)"}
                  </button>
                )}

                {status==="LIVE" && (
                  <button onClick={()=>setConfirm(true)} style={{width:"100%",padding:17,background:"transparent",border:`1px solid ${hex(T.red,0.28)}`,borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:T.red,cursor:"pointer",textTransform:"uppercase",letterSpacing:1.2,transition:"all 0.2s",backdropFilter:"blur(8px)"}}>
                    🏁 Wedstrijd beëindigen
                  </button>
                )}

                {status==="FINISHED" && locked && (
                  <div style={{background:`linear-gradient(135deg,${hex(U,0.1)},${hex(U,0.03)})`,border:`1px solid ${hex(U,0.3)}`,borderRadius:18,padding:"14px 16px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                    <div style={{fontSize:12,color:T.text2,fontFamily:"Barlow,sans-serif",lineHeight:1.4}}>🔒 Wedstrijdgegevens staan op slot. Druk op Wijzigen om aan te passen.</div>
                    <button onClick={()=>setLocked(false)} style={{flexShrink:0,padding:"9px 16px",background:M.gradD,border:"none",borderRadius:100,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,letterSpacing:0.5,cursor:"pointer"}}>✏️ Wijzigen</button>
                  </div>
                )}
                {status==="FINISHED" && !locked && aiOut && (
                  <button onClick={endMatch} disabled={loading} style={{width:"100%",padding:15,background:"transparent",border:`1px solid ${hex(U,0.4)}`,borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,color:U,cursor:loading?"wait":"pointer",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>
                    🔄 Content opnieuw genereren
                  </button>
                )}
                {status==="FINISHED" && aiOut && (
                  <button onClick={()=>setScreen("output")} style={{width:"100%",padding:17,background:M.gradD,border:"none",borderRadius:100,fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:"#fff",cursor:"pointer",textTransform:"uppercase",letterSpacing:1.2,boxShadow:`0 8px 28px ${hex(M.purple,0.4)}`,marginBottom:12}}>
                    📸 Bekijk content
                  </button>
                )}
                {status==="FINISHED" && (
                  <button onClick={resetMatch} style={{width:"100%",padding:14,background:"transparent",border:`1px solid ${T.border3}`,borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:T.text4,cursor:"pointer",letterSpacing:0.5}}>
                    ↻ Nieuwe wedstrijd starten
                  </button>
                )}
              </>)}
            </>)}

            {/* GOALS */}
            {screen==="goals" && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
                {[{t:"GOAL",icon:"⚽",label:"Doelpunt",c:C},{t:"OWN",icon:"⚽",label:"Tegendoelpunt",c:T.red}].map(({t,icon,label,c})=>(
                  <button key={t} onClick={()=>setModal(t)} style={{padding:"24px 16px",background:hex(c,0.07),border:`1px solid ${hex(c,0.2)}`,borderRadius:22,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,color:c,cursor:"pointer",textTransform:"uppercase",display:"flex",flexDirection:"column",alignItems:"center",gap:12,transition:"all 0.18s",boxShadow:`inset 0 1px 0 ${hex(c,0.15)}`}}>
                    <span style={{fontSize:36,filter:`drop-shadow(0 4px 8px ${hex(c,0.4)})`}}>{icon}</span>{label}
                  </button>
                ))}
              </div>
              {events.filter(e=>e.type==="GOAL"||e.type==="OWN").length===0 ? <Empty icon="⚽" label="Nog geen doelpunten" /> : events.filter(e=>e.type==="GOAL"||e.type==="OWN").map(e=><TimelineRow key={e.id} e={e} onDelete={delEv} live={status==="LIVE"} C={C} />)}
            </>)}

            {/* KAARTEN */}
            {screen==="kaarten" && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:28}}>
                {[{t:"YELLOW",icon:"🟨",label:"Gele kaart",c:T.yellow},{t:"RED",icon:"🟥",label:"Rode kaart",c:T.red}].map(({t,icon,label,c})=>(
                  <button key={t} onClick={()=>setModal(t)} style={{padding:"24px 16px",background:hex(c,0.07),border:`1px solid ${hex(c,0.2)}`,borderRadius:22,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,color:c,cursor:"pointer",textTransform:"uppercase",display:"flex",flexDirection:"column",alignItems:"center",gap:12,transition:"all 0.18s",boxShadow:`inset 0 1px 0 ${hex(c,0.15)}`}}>
                    <span style={{fontSize:36}}>{icon}</span>{label}
                  </button>
                ))}
              </div>
              <button onClick={()=>setModal("RED_OPP")} style={{width:"100%",padding:"16px",marginBottom:28,background:hex(T.red,0.07),border:`1px solid ${hex(T.red,0.2)}`,borderRadius:18,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,color:T.red,cursor:"pointer",textTransform:"uppercase",letterSpacing:0.8,display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`inset 0 1px 0 ${hex(T.red,0.15)}`}}>
                <span style={{fontSize:26}}>🟥</span> Rode kaart tegenstander
              </button>
              {events.filter(e=>e.type==="YELLOW"||e.type==="RED").length===0 ? <Empty icon="🟨" label="Geen kaarten" /> : events.filter(e=>e.type==="YELLOW"||e.type==="RED").map(e=><TimelineRow key={e.id} e={e} onDelete={delEv} live={status==="LIVE"} C={C} />)}
            </>)}

            {/* WISSELS */}
            {screen==="wissels" && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} />
              <button onClick={()=>setModal("SUB")} style={{width:"100%",padding:20,background:hex(U,0.07),border:`1px solid ${hex(U,0.2)}`,borderRadius:22,fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:U,cursor:"pointer",textTransform:"uppercase",letterSpacing:1,marginBottom:28,display:"flex",alignItems:"center",justifyContent:"center",gap:12,boxShadow:`inset 0 1px 0 ${hex(U,0.15)}`}}>
                <span style={{fontSize:26}}>🔄</span> Wissel registreren
              </button>
              {events.filter(e=>e.type==="SUB").length===0 ? <Empty icon="🔄" label="Geen wissels" /> : events.filter(e=>e.type==="SUB").map(e=><TimelineRow key={e.id} e={e} onDelete={delEv} live={status==="LIVE"} C={C} />)}
            </>)}

            {/* SPELBEELD */}
            {screen==="spelbeeld" && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} />
              <SHead label="1e Helft — Openingsfase (0–20 min)" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{H1_F1.map(f=><Chip key={f} label={f} active={h1f1===f} onClick={()=>{if(locked)return;setH1f1(h1f1===f?"":f);}} color={U} gradient />)}</div>
              <SHead label="1e Helft — Middenfase (20–35 min)" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{H1_F2.map(f=><Chip key={f} label={f} active={h1f2===f} onClick={()=>{if(locked)return;setH1f2(h1f2===f?"":f);}} color={U} gradient />)}</div>
              <SHead label="1e Helft — Slotfase (35–45 min)" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{H1_F3.map(f=><Chip key={f} label={f} active={h1f3===f} onClick={()=>{if(locked)return;setH1f3(h1f3===f?"":f);}} color={U} gradient />)}</div>
              <SHead label="2e Helft — Openingsfase (45–65 min)" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{H2_F1.map(f=><Chip key={f} label={f} active={h2f1===f} onClick={()=>{if(locked)return;setH2f1(h2f1===f?"":f);}} color={U} gradient />)}</div>
              <SHead label="2e Helft — Middenfase (65–80 min)" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{H2_F2.map(f=><Chip key={f} label={f} active={h2f2===f} onClick={()=>{if(locked)return;setH2f2(h2f2===f?"":f);}} color={U} gradient />)}</div>
              <SHead label="2e Helft — Slotfase (80–90 min)" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{H2_F3.map(f=><Chip key={f} label={f} active={h2f3===f} onClick={()=>{if(locked)return;setH2f3(h2f3===f?"":f);}} color={U} gradient />)}</div>
              <SHead label="Eindbeeld van de wedstrijd" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:4}}>{ALG_BEELD.map(w=><Chip key={w} label={w} active={algBeld===w} onClick={()=>{if(locked)return;setAlgBeld(algBeld===w?"":w);}} color={U} gradient />)}</div>
              <div style={{marginTop:28,paddingTop:20,borderTop:`1px solid ${T.border}`}}>
                <BackBtn onClick={()=>setScreen("dashboard")} label="Terug naar dashboard" />
              </div>
            </>)}

            {/* MAN OF THE MATCH */}
            {screen==="uitblinkers" && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} />
              {home < away ? (
                <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border2}`,borderRadius:18,padding:24,textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:10}}>😔</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:T.text,marginBottom:6,letterSpacing:0.5}}>Geen Man of the Match</div>
                  <div style={{fontSize:13,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>Bij een verloren wedstrijd kiezen we geen Man of the Match.</div>
                </div>
              ) : (
                <>
                  <SHead label="Man of the Match" C={C} />
                  <div style={{marginBottom:8}}><PlayerSelect value={motm} onChange={v=>{if(!locked)setMotm(v);}} squad={squad} placeholder="Kies of typ speler..." /></div>
                  <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5,padding:"4px 4px",marginBottom:16}}>De Man of the Match krijgt een aparte spotlight-post na de wedstrijd.</div>

                  {/* MOTM redenen — aantik max 9 opties */}
                  {motm && (
                    <>
                      <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",marginBottom:10,opacity:0.7}}>Waarom MOTM?</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
                        {MOTM_REDENEN.map(r=>{
                          const active = motmRedenen.includes(r.key);
                          return (
                            <button key={r.key} onClick={()=>{if(locked)return;toggleMotmReden(r.key);}} style={{padding:"10px 13px",background:active?hex(U,0.18):hex(U,0.05),border:`1px solid ${active?U:hex(U,0.2)}`,borderRadius:12,color:active?T.text:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:active?900:700,letterSpacing:0.5,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.15s"}}>
                              <span style={{fontSize:14}}>{r.icon}</span>
                              <span>{r.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {motmRedenen.length>0 && (
                        <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginTop:6}}>{motmRedenen.length} reden{motmRedenen.length===1?"":"en"} geselecteerd — verwerkt in MOTM-post & verslag</div>
                      )}
                    </>
                  )}
                </>
              )}
            </>)}

            {/* BIJZONDERHEDEN */}
            {(screen==="bijzonderheden"||screen==="wedstrijdinfo") && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} />
              <SHead label="📌 Belangrijke wedstrijdmomenten" C={C} />
              {keyMoments.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:`${hex(U,0.06)}`,border:`1px solid ${hex(U,0.18)}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
                  <span style={{fontSize:14}}>{m.type.icon}</span>
                  <span style={{fontSize:12,fontWeight:800,color:U,fontFamily:"'Barlow Condensed',sans-serif",minWidth:30}}>{m.minute}'</span>
                  <span style={{flex:1,fontSize:13,color:T.text2,fontFamily:"Barlow,sans-serif"}}>{m.type.label}{m.team?` · ${m.team==="tegenstander"?"tegenstander":(clubName||"wij")}`:""}{m.player?` — ${m.player}`:""}{m.player2?` ⇄ ${m.player2}`:""}</span>
                  <button onClick={()=>setKeyMoments(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:T.text4,cursor:"pointer",fontSize:18}}>×</button>
                </div>
              ))}
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:24,marginTop:keyMoments.length?6:0}}>
                {[
                  {key:"chance",      icon:"⚡", label:"Grote kans",             teamChoice:true},
                  {key:"penalty_miss",icon:"🥅", label:"Penalty gemist",          teamChoice:true},
                  {key:"penalty",     icon:"⚖️", label:"Niet gegeven penalty",    teamChoice:true},
                  {key:"disallowed",  icon:"❌", label:"Afgekeurde goal",         teamChoice:true},
                  {key:"bar",         icon:"🏃", label:"Paal/lat",               teamChoice:true},
                  {key:"big_save",    icon:"🧤", label:"Belangrijke redding",     teamChoice:true},
                  {key:"injury",      icon:"🩹", label:"Blessure + wissel",       ownOnly:true, needsPlayer:true, needsPlayer2:true},
                ].map(t=>(
                  <button key={t.key} onClick={()=>setAddMoment(t)} style={{padding:"10px 14px",background:hex(U,0.08),border:`1px solid ${hex(U,0.22)}`,borderRadius:11,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:0.5,boxShadow:`0 0 8px ${hex(U,0.1)}`}}>+ {t.icon} {t.label}</button>
                ))}
              </div>

              <SHead label="🎖️ Bijzondere wedstrijdinfo" C={C} />
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:24}}>
                {[
                  {key:"return",icon:"🔙",label:"Rentree na lange tijd",needsPlayer:true},
                  {key:"jubileum",icon:"🎉",label:"Jubileum wedstrijd",needsPlayer:false},
                  {key:"derby",icon:"🔥",label:"Derby"},
                  {key:"promotie",icon:"⬆️",label:"Promotie/Degradatiewedstrijd"},
                  {key:"periode",icon:"🏆",label:"Periodekampioenswedstrijd"},
                  {key:"first",icon:"🌱",label:"Eerste wedstrijd seizoen"},
                  {key:"last",icon:"🏁",label:"Laatste wedstrijd seizoen"},
                ].map(t=>{
                  const active = specialInfo.find(s=>s.type.key===t.key);
                  return (
                    <button key={t.key} onClick={()=>{
                      if (active) setSpecialInfo(p=>p.filter(s=>s.type.key!==t.key));
                      else if (t.needsPlayer) setAddSpecial(t);
                      else setSpecialInfo(p=>[...p,{type:t}]);
                    }} style={{padding:"10px 14px",background:active?hex(U,0.18):hex(U,0.06),border:`1px solid ${active?U:hex(U,0.2)}`,borderRadius:11,color:active?U:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:0.5,boxShadow:active?`0 0 12px ${hex(U,0.3)}`:`0 0 6px ${hex(U,0.08)}`}}>{active?"✓":"+"} {t.icon} {t.label}{active&&active.player?` — ${active.player}`:""}</button>
                  );
                })}
              </div>

              {/* ══════════════════════════════════
                  ÉÉN VRIJE TOELICHTING (MAX 1 / 60 TEKENS)
                  Alleen voor jubileum of unieke context
              ══════════════════════════════════ */}
              <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border2}`,borderRadius:16,padding:16,marginBottom:24}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:13}}>🗒️</span>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900,color:T.text2,letterSpacing:1,textTransform:"uppercase"}}>Korte toelichting</span>
                    <span style={{fontSize:9,padding:"2px 7px",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border3}`,borderRadius:10,color:T.text4,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>Optioneel</span>
                  </div>
                  <span style={{fontSize:10,color:bijzN.trim()?U:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1}}>{bijzN.trim()?"1/1":"0/1"} gebruikt</span>
                </div>
                <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:10}}>
                  Eén korte zin voor unieke context — bv. jubileum, bijzondere omstandigheden. Max 60 tekens, max 1 per wedstrijd.
                </div>
                <div style={{position:"relative"}}>
                  <input
                    value={bijzN}
                    onChange={e=>setBijzN(e.target.value.slice(0,60))}
                    maxLength={60}
                    placeholder="bv. 50-jarig bestaan VV Ons Dorp"
                    style={{
                      width:"100%",
                      background:"rgba(255,255,255,0.04)",
                      border:`1px solid ${bijzN.trim()?hex(U,0.4):T.border3}`,
                      borderRadius:12,
                      padding:"12px 60px 12px 14px",
                      color:T.text,
                      fontFamily:"Barlow,sans-serif",
                      fontSize:13,
                      outline:"none",
                      boxSizing:"border-box",
                    }}
                  />
                  <span style={{
                    position:"absolute",
                    right:14,
                    top:"50%",
                    transform:"translateY(-50%)",
                    fontSize:10,
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:800,
                    color:bijzN.length>=55?T.yellow:bijzN.length>=60?T.red:T.text4,
                    letterSpacing:0.5,
                    pointerEvents:"none",
                  }}>{bijzN.length}/60</span>
                </div>
                {bijzN.trim() && (
                  <button
                    onClick={()=>setBijzN("")}
                    style={{marginTop:8,background:"none",border:"none",color:T.text4,fontFamily:"Barlow,sans-serif",fontSize:11,cursor:"pointer",padding:0,textDecoration:"underline",textDecorationStyle:"dotted"}}
                  >
                    Toelichting wissen
                  </button>
                )}
              </div>
              <div style={{marginTop:28,paddingTop:20,borderTop:`1px solid ${T.border}`}}>
                <BackBtn onClick={()=>setScreen("dashboard")} label="Terug naar dashboard" />
              </div>
            </>)}

            {/* OVERZICHT */}
            {screen==="overzicht" && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} />
              {(()=>{
                // Combineer events + keyMoments gesorteerd op minuut
                const allItems = [
                  ...events.map(e=>({id:e.id, kind:"event", min:parseInt(e.minute)||0, data:e})),
                  ...keyMoments.map((m,i)=>({id:`km-${i}`, kind:"moment", min:parseInt(m.minute)||0, data:m})),
                ].sort((a,b)=>a.min-b.min);
                const total = allItems.length + specialInfo.length;
                return (<>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:800,letterSpacing:3,color:T.text4,textTransform:"uppercase",marginBottom:16}}>
                    {total} {total===1?"item":"items"} geregistreerd
                  </div>

                  {allItems.length===0 && specialInfo.length===0
                    ? <Empty icon="📊" label="Nog geen events of momenten" />
                    : (<>
                        {allItems.map(item=>{
                          if (item.kind==="event") {
                            return <TimelineRow key={item.id} e={item.data} onDelete={delEv} live={status==="LIVE"} C={C} />;
                          }
                          // keyMoment row
                          const m = item.data;
                          return (
                            <div key={item.id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${T.border}`}}>
                              <div style={{width:42,flexShrink:0,textAlign:"right"}}>
                                {m.minute
                                  ? <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:T.text3,letterSpacing:-0.5}}>{m.minute}'</span>
                                  : <span style={{fontSize:18}}>{m.type.icon}</span>
                                }
                              </div>
                              <div style={{width:9,height:9,borderRadius:"50%",background:"#7c3aed",flexShrink:0,boxShadow:"0 0 8px rgba(124,58,237,0.7)"}} />
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontFamily:"Barlow,sans-serif",fontSize:14,color:T.text,fontWeight:600}}>
                                  {m.player||""}
                                  {m.player2 && <span style={{color:T.text4,fontSize:12}}> ⇄ {m.player2}</span>}
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
                                  <span style={{fontSize:10,color:"#9d78f5",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>{m.type.icon} {m.type.label}</span>
                                </div>
                              </div>
                              {status==="LIVE" && (
                                <button onClick={()=>setKeyMoments(p=>p.filter(km=>km!==m))} style={{background:"none",border:"none",color:T.text4,cursor:"pointer",fontSize:20,padding:"4px 8px",flexShrink:0,lineHeight:1}}>×</button>
                              )}
                            </div>
                          );
                        })}

                        {specialInfo.length>0 && (
                          <div style={{marginTop:20}}>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:800,letterSpacing:3,color:T.text4,textTransform:"uppercase",marginBottom:10}}>🎖️ Bijzondere wedstrijdinfo</div>
                            {specialInfo.map((s,i)=>(
                              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                                <div style={{width:42,flexShrink:0,textAlign:"right",fontSize:18}}>{s.type.icon}</div>
                                <div style={{width:9,height:9,borderRadius:"50%",background:T.text4,flexShrink:0}} />
                                <div style={{flex:1}}>
                                  <div style={{fontFamily:"Barlow,sans-serif",fontSize:14,color:T.text,fontWeight:600}}>{s.type.label}{s.player?` — ${s.player}`:""}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>)
                  }
                </>);
              })()}
            </>)}

            {/* ══════════════════════════
                OUTPUT
            ══════════════════════════ */}
            {screen==="output" && (<>
              {loading && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"90px 0"}}>
                  <div style={{width:44,height:44,border:`2px solid ${T.border2}`,borderTopColor:C,borderRadius:"50%",animation:"spin 0.7s linear infinite",boxShadow:`0 0 20px ${hex(U,0.3)}`}} />
                  <span style={{color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,letterSpacing:3,textTransform:"uppercase"}}>Genereren...</span>
                </div>
              )}
              {aiErr && (
                <div style={{background:hex(T.red,0.05),border:`1px solid ${hex(T.red,0.18)}`,borderRadius:18,padding:22,marginBottom:16}}>
                  <div style={{fontSize:13,color:"#ff8a80",marginBottom:14,lineHeight:1.6,fontFamily:"Barlow,sans-serif"}}>{aiErr}</div>
                  <button onClick={endMatch} style={{padding:"11px 22px",background:T.red,border:"none",borderRadius:12,color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,letterSpacing:0.5,boxShadow:`0 6px 20px ${hex(T.red,0.35)}`}}>🔄 Opnieuw proberen</button>
                </div>
              )}
              {!loading&&!aiOut&&!aiErr && (
                <div style={{textAlign:"center",padding:"80px 0"}}>
                  <div style={{fontSize:52,marginBottom:14,opacity:0.12}}>📸</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,letterSpacing:2.5,textTransform:"uppercase",color:T.text4,marginBottom:28,lineHeight:1.6}}>Beëindig de wedstrijd<br/>om content te genereren</div>
                  {status==="LIVE" && <button onClick={()=>setConfirm(true)} style={{padding:"14px 28px",background:hex(T.red,0.08),border:`1px solid ${hex(T.red,0.25)}`,borderRadius:16,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:T.red,cursor:"pointer",textTransform:"uppercase",letterSpacing:1}}>🏁 Wedstrijd beëindigen</button>}
                </div>
              )}
              {!loading&&aiOut&&(<>

                {/* VISUALS */}
                <div style={{marginBottom:20}}>
                  {chosenTheme && (
                    <div style={{marginBottom:16}}>
                      {/* Huidig thema + acties */}
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:TAC,boxShadow:`0 0 6px ${TAC}`}}/>
                        {theme.ac2 && <div style={{width:10,height:10,borderRadius:"50%",background:theme.ac2,boxShadow:`0 0 6px ${theme.ac2}`,marginLeft:-4}}/>}
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:800,color:TAC,letterSpacing:0.5,flex:1}}>{theme.name}</span>
                        <button onClick={()=>setChosenTheme(THEMES[Math.floor(Math.random()*THEMES.length)].id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:T.text4,padding:0,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:0.5}}>↻ willekeurig</button>
                      </div>

                      {/* Stijl picker — dropdown (categorie) + kleurvarianten daaronder */}
                      {(() => {
                        const cats = [];
                        const seen = new Set();
                        THEMES.forEach(t => {
                          const c = t.name.split(' · ')[0];
                          if (!seen.has(c)) { seen.add(c); cats.push(c); }
                        });
                        const currentCat = theme.name.split(' · ')[0];
                        const variants = THEMES.filter(t => t.name.split(' · ')[0] === currentCat);
                        return (<>
                          <div style={{position:"relative",marginBottom:variants.length>1?10:0}}>
                            <button onClick={()=>setStijlMenuOpen(o=>!o)} style={{width:"100%",padding:"10px 14px",background:M.gradD,border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900,letterSpacing:1.2,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:`0 4px 14px ${hex(M.purple,0.3)}`}}>
                              <span>Stijl · {currentCat}</span>
                              <span style={{fontSize:11}}>{stijlMenuOpen?"▴":"▾"}</span>
                            </button>
                            {stijlMenuOpen && (
                              <div style={{position:"absolute",top:"100%",left:0,right:0,marginTop:6,background:"#15131c",border:`1px solid ${T.border2}`,borderRadius:12,padding:6,zIndex:20,boxShadow:"0 12px 40px rgba(0,0,0,0.5)",maxHeight:280,overflowY:"auto"}}>
                                {cats.map(c => {
                                  const isCur = c === currentCat;
                                  return (
                                    <button key={c} onClick={()=>{
                                      if (c !== currentCat) {
                                        const first = THEMES.find(t => t.name.split(' · ')[0] === c);
                                        if (first) setChosenTheme(first.id);
                                      }
                                      setStijlMenuOpen(false);
                                    }} style={{display:"block",width:"100%",padding:"9px 12px",background:isCur?hex(M.purple,0.18):"transparent",border:"none",borderRadius:8,color:isCur?"#fff":T.text2,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:isCur?900:700,letterSpacing:0.5,textTransform:"uppercase",textAlign:"left"}}>
                                      {c}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {variants.length > 1 && (
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              {variants.map(t => {
                                const isActive = t.id === chosenTheme;
                                return (
                                  <button key={t.id} onClick={()=>setChosenTheme(t.id)} title={t.name} style={{padding:"7px 10px",background:isActive?`linear-gradient(135deg,${t.ac},${t.ac2||t.ac})`:"rgba(255,255,255,0.04)",border:`1.5px solid ${isActive?t.ac:T.border3}`,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.18s"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:2}}>
                                      <div style={{width:8,height:8,borderRadius:"50%",background:t.ac,border:isActive?"1px solid #000":"none"}}/>
                                      {t.ac2 && <div style={{width:8,height:8,borderRadius:"50%",background:t.ac2,marginLeft:-3,border:isActive?"1px solid #000":"none"}}/>}
                                    </div>
                                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:800,color:isActive?"#000":T.text2,letterSpacing:0.5,whiteSpace:"nowrap"}}>{t.name.replace(/^[^·]+ · /,"")}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>);
                      })()}
                    </div>
                  )}
                  {[
                    { id:"classic", name:"Wedstrijdkaart",  desc:"1:1 · Instagram & FB" },
                    { id:"story",   name:"Story 9:16",       desc:"9:16 · Stories & Reels" },
                    ...(motm&&home>=away?[{ id:"motm", name:"Man of the Match", desc:"9:16 · MOTM spotlight" }]:[]),
                  ].map(l=>(
                    <div key={l.id} style={{marginBottom:28}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,letterSpacing:1,color:TAC,textTransform:"uppercase"}}>{l.name}</div>
                        <div style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif"}}>{l.desc}</div>
                      </div>
                      <div id={`layout-${l.id}`} style={{borderRadius:18,overflow:"hidden",boxShadow:`0 16px 48px rgba(0,0,0,0.6)`,marginBottom:10,...(l.id==="story"?{maxWidth:260,margin:"0 auto 10px"}:{})}}>
                        {l.id==="classic" && (
<div style={{width:"100%",aspectRatio:"1/1",containerType:"inline-size",position:"relative",background:TBG,fontFamily:"'Barlow Condensed',sans-serif",overflow:"hidden"}}>

                      {/* Achtergrond patroon — uit thema */}
                      {renderPattern(1)}

                      {/* Flex column wrapper — alles past binnen het vierkant */}
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>

                        {/* TOP BAR */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3% 4% 0",flexShrink:0}}>
                          <span style={{fontSize:((teamLabel||clubName).length>22?"2.2cqw":(teamLabel||clubName).length>16?"2.5cqw":"2.8cqw"),fontWeight:900,letterSpacing:2,color:`${TAC}cc`,textTransform:"uppercase"}}>{teamLabel||clubName}</span>
                          <span style={{fontSize:"2.2cqw",color:"rgba(255,255,255,0.2)"}}>powered by Matchly</span>
                        </div>

                        {/* SCORE — groot en dominant, zoals screenshot */}
                        <div style={{display:"flex",alignItems:"center",padding:"1% 3% 0",flexShrink:0,gap:"1%"}}>

                          {/* THUIS — logo cirkel + naam */}
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2%",flexShrink:0,width:"22%"}}>
                            <div style={{width:"65%",aspectRatio:"1/1",borderRadius:"50%",border:`2.5px solid ${thex(TAC,0.7)}`,background:thex(TAC,0.12),display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 16px ${thex(TAC,0.3)}`,overflow:"hidden"}}>
                              {(hvLogoUrl||logo)
                                ?<img src={hvLogoUrl||logo} style={{width:"100%",height:"100%",objectFit:"contain",padding:"10%"}} crossOrigin="anonymous"/>
                                :<div style={{fontSize:"9cqw",fontWeight:900,color:TAC}}>{clubName.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>
                              }
                            </div>
                            <span style={{fontSize:"2.6cqw",fontWeight:900,color:"#fff",textAlign:"center",lineHeight:1.1}}>{clubName}</span>
                          </div>

                          {/* CIJFERS — domineren het midden */}
                          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"1%"}}>
                            <span style={{fontSize:"42cqw",fontWeight:900,color:"#fff",lineHeight:0.85,textShadow:`0 0 60px ${thex(TAC,1)},0 0 120px ${thex(TAC,0.5)}`}}>{home}</span>
                            <span style={{fontSize:"12cqw",color:"rgba(255,255,255,0.2)",fontWeight:300,lineHeight:1,marginTop:"-4%"}}>-</span>
                            <span style={{fontSize:"42cqw",fontWeight:900,color:"rgba(255,255,255,0.38)",lineHeight:0.85}}>{away}</span>
                          </div>

                          {/* UIT — logo cirkel + naam */}
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2%",flexShrink:0,width:"22%"}}>
                            <div style={{width:"65%",aspectRatio:"1/1",borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                              {oppLogoUrl
                                ?<img src={oppLogoUrl} style={{width:"100%",height:"100%",objectFit:"contain",padding:"10%"}} crossOrigin="anonymous"/>
                                :<div style={{fontSize:"9cqw",fontWeight:900,color:"rgba(255,255,255,0.3)"}}>{(opponent||"TG").replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>
                              }
                            </div>
                            <span style={{fontSize:"2.6cqw",fontWeight:900,color:"rgba(255,255,255,0.45)",textAlign:"center",lineHeight:1.1}}>{opponent||"Tegenstander"}</span>
                          </div>
                        </div>

                        {/* HEADLINE — themabalk met gradient, quote in donkere tekst */}
                        <div style={{flexShrink:0,background:themeBarGradient,padding:"2.5% 5%",margin:"2% 0 0 0",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)"}}>
                          {(()=>{
                            const len=aiOut.headline.length;
                            const fs=len>60?"3cqw":len>45?"3.6cqw":"4.2cqw";
                            return (
                              <div style={{fontSize:fs,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",lineHeight:1.2,color:"rgba(0,0,0,0.9)",textAlign:"center",textShadow:"0 1px 2px rgba(255,255,255,0.15)"}}>"{aiOut.headline}"</div>
                            );
                          })()}
                        </div>

                        {/* BODY — 3 kolommen, linker dynamisch */}
                        {(()=>{
                          const cGoals=events.filter(e=>e.type==="GOAL"||e.type==="OWN");
                          const cCards=events.filter(e=>e.type==="YELLOW"||e.type==="RED");
                          const cSubs=events.filter(e=>e.type==="SUB");
                          const cIsClean=away===0&&cGoals.length===0;
                          const cFewGoals=cGoals.length<=1;
                          const cOther=[
                            ...cCards.map(c=>({minute:parseInt(c.minute)||0,icon:c.type==="YELLOW"?"🟨":"🟥",label:c.player||"—",sub:c.type==="YELLOW"?"Gele kaart":"Rode kaart",isGoal:false})),
                            ...cSubs.map(s=>({minute:parseInt(s.minute)||0,icon:"🔄",label:s.playerIn||"—",sub:"↑ · "+(s.playerOut||"—")+" eraf",isGoal:false})),
                          ].sort((a,b)=>a.minute-b.minute);
                          let cHs=0,cAs=0;
                          const cGoalItems=cGoals.map(g=>{
                            if(g.type==="OWN")cAs++;else cHs++;
                            return {minute:parseInt(g.minute)||0,icon:"⚽",label:g.type==="OWN"?(opponent||"Teg."):(g.player||"—"),badge:cHs+"-"+cAs,isGoal:true};
                          });
                          const cAll=[...cGoalItems,...cOther].sort((a,b)=>a.minute-b.minute);
                          const cFases=[{l:"1e helft",v:h1f1},{l:"2e helft",v:h2f3}].filter(f=>f.v);
                          const cTotal=cAll.length+cFases.length+(cIsClean?1:0);
                          const cSc=Math.max(0.7,Math.min(1.1,4/Math.max(cTotal,1)));
                          const cFs=v=>(parseFloat(v)*cSc)+"cqw";
                          const renderLeftCol=()=>{
                            if(!cFewGoals){
                              let h2=0,a2=0;
                              // Dynamische schaal: meer goals = kleiner lettertype
                              const gSc=Math.max(0.75,Math.min(1,5/Math.max(cGoals.length,1)));
                              const gFs=v=>(parseFloat(v)*gSc)+"cqw";
                              return (<>
                                <div style={{fontSize:gFs(2.5),fontWeight:900,letterSpacing:2,color:TAC+"cc",textTransform:"uppercase",marginBottom:gFs(1.2)}}>Doelpunten</div>
                                {cGoals.slice(0,8).map((e,i)=>{
                                  if(e.type==="OWN")a2++;else h2++;
                                  const sc2=h2+"-"+a2;
                                  return (<div key={i} style={{display:"flex",alignItems:"center",marginBottom:gFs(1.2),gap:"2%"}}>
                                    <span style={{fontSize:gFs(2.6),color:i<4?TAC+"cc":TAC2+"cc",fontWeight:900,flexShrink:0,width:"9%",textAlign:"right"}}>{formatMinuut(e.minute,e.extra,e.half)}</span>
                                    <span style={{fontSize:gFs(2.6),color:"rgba(255,255,255,0.82)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:600}}>{e.type==="OWN"?(opponent||"Tegenstander"):(e.player||"—")}</span>
                                    <span style={{fontSize:gFs(1.9),color:thex(i<4?TAC:TAC2,0.85),fontWeight:800,flexShrink:0,background:thex(i<4?TAC:TAC2,0.12),padding:"0.4% 1.2%",borderRadius:"3px"}}>{sc2}</span>
                                  </div>);
                                })}
                              </>);
                            }
                            return (<>
                              {cIsClean&&(<div style={{display:"flex",alignItems:"center",gap:"3%",marginBottom:cFs(2),background:"linear-gradient(90deg,"+thex(TAC,0.1)+",transparent)",borderLeft:"2px solid "+TAC,padding:cFs(1)+" 3%",borderRadius:"0 2% 2% 0"}}>
                                <span style={{fontSize:cFs(3.5)}}>🔒</span>
                                <div><div style={{fontSize:cFs(2),fontWeight:900,color:TAC+"cc",textTransform:"uppercase",letterSpacing:1}}>Clean sheet</div><div style={{fontSize:cFs(2.5),fontWeight:700,color:"rgba(255,255,255,0.7)"}}>Nul gehouden</div></div>
                              </div>)}
                              {cAll.length>0&&(<>
                                <div style={{fontSize:cFs(2.2),fontWeight:900,letterSpacing:2,color:TAC+"88",textTransform:"uppercase",marginBottom:cFs(1)}}>{cGoals.length>0&&cCards.length===0&&cSubs.length===0?"Doelpunten":"Tijdlijn"}</div>
                                {cAll.map((e,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"2%",marginBottom:cFs(1.2),background:"rgba(255,255,255,0.04)",borderRadius:"2%",padding:cFs(0.7)+" 2%"}}>
                                  <span style={{fontSize:cFs(2.4),fontWeight:900,color:TAC,width:"8%",textAlign:"right",flexShrink:0}}>{e.minute}'</span>
                                  <span style={{fontSize:cFs(2.7),flexShrink:0}}>{e.icon}</span>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:cFs(2.3),fontWeight:700,color:"rgba(255,255,255,0.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1}}>{e.isGoal&&<span style={{color:"rgba(255,255,255,0.3)",marginRight:"2%",fontSize:cFs(2)}}>{e.badge} </span>}{e.label}</div>
                                    {!e.isGoal&&<div style={{fontSize:cFs(1.9),color:"rgba(255,255,255,0.35)",lineHeight:1.2}}>{e.sub}</div>}
                                  </div>
                                </div>))}
                              </>)}
                              {cFases.length>0&&(<>
                                <div style={{fontSize:cFs(2.2),fontWeight:900,letterSpacing:2,color:TAC+"88",textTransform:"uppercase",marginBottom:cFs(1),marginTop:cAll.length>0?cFs(1.5):"0"}}>Spelbeeld</div>
                                {cFases.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"2%",marginBottom:cFs(1),background:"rgba(255,255,255,0.04)",borderRadius:"2%",padding:cFs(0.7)+" 2%"}}>
                                  <span style={{fontSize:cFs(2),fontWeight:900,color:TAC+"88",width:"20%",flexShrink:0}}>{f.l}</span>
                                  <span style={{fontSize:cFs(2.2),fontWeight:700,color:"rgba(255,255,255,0.75)",flex:1}}>{f.v}</span>
                                </div>))}
                              </>)}
                            </>);
                          };
                          return (
                        <div style={{display:"flex",padding:"2% 4% 0",gap:"3%",flex:1,minHeight:0}}>
                          <div style={{flex:1,overflow:"hidden"}}>{renderLeftCol()}</div>

                          {/* MOTM midden — niet bij verlies */}
                          {motm&&home>=away&&(
                            <div style={{width:"22%",display:"flex",flexDirection:"column",alignItems:"center",gap:"3%",flexShrink:0}}>
                              <div style={{fontSize:"2.2cqw",fontWeight:900,letterSpacing:1.5,color:`${TAC2}bb`,textTransform:"uppercase",textAlign:"center"}}>MOTM</div>
                              <div style={{background:thex(TAC,0.1),border:`1px solid ${thex(TAC,0.25)}`,borderRadius:"10%",padding:"4% 3%",textAlign:"center",width:"100%",position:"relative",overflow:"hidden"}}>
                                <div style={{position:"absolute",top:0,right:0,bottom:0,width:"3%",background:`linear-gradient(180deg,${thex(TAC2,0.6)},transparent)`}}/>
                                <div style={{fontSize:"6cqw",marginBottom:"3%"}}>🏆</div>
                                <div style={{fontSize:(motm.length>16?"2.2cqw":motm.length>12?"2.5cqw":"2.8cqw"),fontWeight:900,color:"#fff",lineHeight:1.15}}>{motm}</div>
                              </div>
                            </div>
                          )}

                          {/* In het kort */}
                          <div style={{flex:1,display:"flex",flexDirection:"column",gap:"2%",overflow:"hidden",paddingBottom:"2%"}}>
                            <div style={{fontSize:"2.5cqw",fontWeight:900,letterSpacing:1.5,color:`${TAC}cc`,textTransform:"uppercase",flexShrink:0}}>In het kort</div>
                            {(()=>{
                              const txt=aiOut.samenvatting||aiOut.verslag||"";
                              const fs=txt.length>250?"2cqw":txt.length>200?"2.3cqw":txt.length>150?"2.5cqw":"2.8cqw";
                              return <p style={{fontSize:fs,color:"rgba(255,255,255,0.82)",lineHeight:1.5,margin:0,overflow:"hidden"}}>{txt}</p>;
                            })()}
                          </div>
                        </div>
                          );
                        })()}

                        {/* INSTAGRAM + FACEBOOK + VOLGENDE WEDSTRIJD */}
                        <div style={{display:"flex",gap:"2%",padding:"1% 4% 0",flexShrink:0}}>
                          {igHandle&&(
                            <div style={{flex:1.6,display:"flex",alignItems:"center",gap:"1.5%",background:thex(TAC,0.08),border:`1px solid ${thex(TAC,0.14)}`,borderRadius:"5%",padding:"1% 2%"}}>
                              <img src={IG_ICON} alt="ig" style={{width:14,height:14,flexShrink:0,borderRadius:3}}/>
                              <span style={{fontSize:"2.2cqw",fontWeight:900,color:"rgba(255,255,255,0.7)"}}>{igHandle}</span>
                            </div>
                          )}
                          {fbHandle&&(
                            <div style={{flex:1.6,display:"flex",alignItems:"center",gap:"1.5%",background:thex(TAC,0.08),border:`1px solid ${thex(TAC,0.14)}`,borderRadius:"5%",padding:"1% 2%"}}>
                              <img src={FB_ICON} alt="fb" style={{width:14,height:14,flexShrink:0,borderRadius:3}}/>
                              <span style={{fontSize:"2.2cqw",fontWeight:900,color:"rgba(255,255,255,0.7)"}}>{fbHandle}</span>
                            </div>
                          )}
                          {nextGame&&(
                            <div style={{flex:2,display:"flex",alignItems:"center",gap:"1.5%",background:thex(TAC2||TAC,0.06),border:`1px solid ${thex(TAC2||TAC,0.14)}`,borderRadius:"5%",padding:"1% 2%",justifyContent:"flex-end"}}>
                              <span style={{fontSize:"2.8cqw",flexShrink:0}}>📅</span>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontSize:(nextGame.length>50?"1.6cqw":nextGame.length>35?"1.8cqw":"2cqw"),fontWeight:900,color:"rgba(255,255,255,0.7)",lineHeight:1.2}}>{nextGame}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SPONSOR BALK */}
                        <div style={{flexShrink:0,marginTop:"1.5%"}}>
                          <div style={{background:"rgba(0,0,0,0.55)",borderTop:`3px solid ${TAC}`}}>
                            {postSponsors.length>0&&(
                              <>
                                <div style={{fontSize:"2cqw",fontWeight:900,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",textAlign:"center",padding:"1.5% 0 1%"}}>Mede mogelijk gemaakt door onze trouwe sponsors</div>
                                <div style={{display:"flex",gap:"2%",padding:"0 3% 2%",justifyContent:"center"}}>
                                  {postSponsors.map((s,i)=>(
                                    <div key={i} style={{flex:1,maxWidth:"18%",borderRadius:"8%",padding:"2px",background:tierGradient(s),boxShadow:`0 1px 4px rgba(0,0,0,0.3)`}}>
                                      <div style={{width:"100%",height:"100%",background:"#e8e8e8",borderRadius:"6%",padding:"1.5% 2%",boxSizing:"border-box",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                      {s.url?<img src={s.url} style={{width:"100%",height:"auto",maxHeight:18,objectFit:"contain"}} crossOrigin="anonymous"/>:<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.8cqw",fontWeight:900,color:"#222"}}>{s.name}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                      </div>{/* einde flex column wrapper */}
                    </div>
                        )}
                        {l.id==="story" && (
                        <div style={{width:"100%",aspectRatio:"9/16",containerType:"inline-size",background:TBG,position:"relative",fontFamily:"'Barlow Condensed',sans-serif",overflow:"hidden"}}>
                          {renderPattern(0.85)}
                          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4% 4% 0",flexShrink:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:"2%"}}>
                                {(hvLogoUrl||logo)?<img src={hvLogoUrl||logo} style={{width:"8%",aspectRatio:"1/1",objectFit:"contain",background:"#fff",borderRadius:"12%",padding:"0.5%"}} crossOrigin="anonymous"/>:<div style={{width:"8%",aspectRatio:"1/1",background:thex(TAC,0.2),borderRadius:"12%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3cqw",fontWeight:900,color:TAC}}>{clubName.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>}
                                <div style={{marginLeft:"2%"}}><div style={{fontSize:"3cqw",fontWeight:900,color:"rgba(255,255,255,0.9)",letterSpacing:0.5}}>{clubName}</div>{teamLabel && <div style={{fontSize:"2cqw",color:`${TAC}cc`,letterSpacing:0.5}}>{teamLabel}</div>}</div>
                              </div>
                              <span style={{fontSize:"2cqw",color:"rgba(255,255,255,0.2)"}}>Matchly</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"3% 4%",flexShrink:0}}>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2%",width:"24%"}}>
                                <div style={{width:"90%",aspectRatio:"1/1",borderRadius:"50%",border:`2.5px solid ${thex(TAC,0.7)}`,background:thex(TAC,0.12),display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 16px ${thex(TAC,0.3)}`,overflow:"hidden"}}>
                                  {(hvLogoUrl||logo)?<img src={hvLogoUrl||logo} style={{width:"100%",height:"100%",objectFit:"contain",padding:"10%"}} crossOrigin="anonymous"/>:<div style={{fontSize:"6cqw",fontWeight:900,color:TAC}}>{clubName.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>}
                                </div>
                                <span style={{fontSize:(clubName.length>20?"1.9cqw":clubName.length>14?"2.2cqw":"2.5cqw"),fontWeight:900,color:"#fff",textAlign:"center"}}>{clubName}</span>
                              </div>
                              <div style={{display:"flex",alignItems:"baseline",gap:"1%"}}>
                                <span style={{fontSize:"26cqw",fontWeight:900,color:"#fff",lineHeight:1,textShadow:`0 0 40px ${thex(TAC,0.8)}`}}>{home}</span>
                                <span style={{fontSize:"9cqw",color:"rgba(255,255,255,0.25)"}}>–</span>
                                <span style={{fontSize:"26cqw",fontWeight:900,color:"rgba(255,255,255,0.35)",lineHeight:1}}>{away}</span>
                              </div>
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"2%",width:"24%"}}>
                                <div style={{width:"90%",aspectRatio:"1/1",borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                                  {oppLogoUrl?<img src={oppLogoUrl} style={{width:"100%",height:"100%",objectFit:"contain",padding:"10%"}} crossOrigin="anonymous"/>:<div style={{fontSize:"6cqw",fontWeight:900,color:"rgba(255,255,255,0.4)"}}>{(opponent||"TG").replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>}
                                </div>
                                <span style={{fontSize:((opponent||"Tegenstander").length>20?"1.9cqw":(opponent||"Tegenstander").length>14?"2.2cqw":"2.5cqw"),fontWeight:900,color:"rgba(255,255,255,0.4)",textAlign:"center"}}>{opponent||"Tegenstander"}</span>
                              </div>
                            </div>
                            {/* THEMABALK met badge + quote, gradient ook op single-color thema's */}
                            <div style={{flexShrink:0,background:themeBarGradient,padding:"2.5% 5% 2.5%",margin:"1% 0 0 0",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)"}}>
                              <div style={{textAlign:"center",marginBottom:"1.5%"}}>
                                <span style={{fontSize:"2.6cqw",fontWeight:900,color:"rgba(0,0,0,0.75)",letterSpacing:2}}>{home>away?"GEWONNEN 🏆":home===away?"GELIJKSPEL":"VERLOREN"}</span>
                              </div>
                              {(()=>{const len=(aiOut.headline||"").length;const fs=len>55?"3.4cqw":len>40?"4cqw":"4.6cqw";
                              return <div style={{fontSize:fs,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",lineHeight:1.2,color:"rgba(0,0,0,0.9)",textAlign:"center",textShadow:"0 1px 2px rgba(255,255,255,0.15)"}}>"{aiOut.headline}"</div>;})()}
                            </div>
                            {(()=>{
                              const stIsClean=away===0;
                              const stFases=[{label:"1e helft",value:h1f1},{label:"2e helft",value:h2f3}].filter(f=>f.value);
                              const stClean=stIsClean&&storyTimeline.filter(e=>e.isGoal).length===0?1:0;
                              const stTotal=storyTimeline.length+stFases.length+stClean;
                              const stSc=storyCalcScale(stTotal);
                              const sFs=v=>(parseFloat(v)*stSc)+"%";
                              const sSp=v=>(parseFloat(v)*stSc)+"%";
                              const stOnlyGoals=storyTimeline.length>0&&storyTimeline.every(e=>e.isGoal);
                              return (
                            <div style={{flex:1,padding:"0 4%",overflow:"hidden",minHeight:0,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                              {stIsClean&&storyTimeline.filter(e=>e.isGoal).length===0&&(
                                <div style={{display:"flex",alignItems:"center",gap:"2.5%",marginBottom:sSp(1.8),background:"linear-gradient(90deg,"+thex(TAC,0.1)+",transparent)",borderLeft:"2px solid "+TAC,borderRadius:"0 2% 2% 0",padding:sSp(1.2)+" 2.5%",flexShrink:0}}>
                                  <span style={{fontSize:sFs(3.5)}}>🔒</span>
                                  <div><div style={{fontSize:sFs(1.9),fontWeight:900,letterSpacing:1,color:TAC+"cc",textTransform:"uppercase"}}>Clean sheet</div><div style={{fontSize:sFs(2.4),fontWeight:700,color:"rgba(255,255,255,0.7)"}}>Nul gehouden</div></div>
                                </div>
                              )}
                              {storyTimeline.length>0&&(<>
                                <div style={{fontSize:sFs(2),fontWeight:900,letterSpacing:2,color:TAC+"88",textTransform:"uppercase",marginBottom:sSp(1),flexShrink:0}}>{stOnlyGoals?"Doelpunten":"Tijdlijn"}</div>
                                {storyTimeline.map((e,i)=>(
                                  <div key={i} style={{display:"flex",alignItems:"center",gap:"2%",marginBottom:sSp(0.85),background:"rgba(255,255,255,0.04)",borderRadius:"2%",padding:sSp(0.85)+" 2%",flexShrink:0}}>
                                    <span style={{fontSize:sFs(2.6),fontWeight:900,color:TAC,width:"8%",textAlign:"right",flexShrink:0}}>{e.minute}'</span>
                                    <span style={{fontSize:sFs(2.7),flexShrink:0}}>{e.icon}</span>
                                    <div style={{flex:1,minWidth:0}}>
                                      <div style={{fontSize:sFs(2.4),fontWeight:700,color:"rgba(255,255,255,0.85)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1}}>{e.isGoal&&<span style={{color:"rgba(255,255,255,0.3)",marginRight:"2%",fontSize:sFs(2)}}>{e.hs}-{e.as} </span>}{e.label}</div>
                                      {!e.isGoal&&<div style={{fontSize:sFs(1.9),color:"rgba(255,255,255,0.35)"}}>{e.sub}</div>}
                                    </div>
                                  </div>
                                ))}
                              </>)}
                              {stFases.length>0&&(<>
                                <div style={{fontSize:sFs(2),fontWeight:900,letterSpacing:2,color:TAC+"88",textTransform:"uppercase",marginBottom:sSp(1),marginTop:storyTimeline.length>0?sSp(1.5):"0",flexShrink:0}}>Spelbeeld</div>
                                {stFases.map((f,i)=>(
                                  <div key={i} style={{display:"flex",alignItems:"center",gap:"2%",marginBottom:sSp(0.85),background:"rgba(255,255,255,0.04)",borderRadius:"2%",padding:sSp(0.85)+" 2%",flexShrink:0}}>
                                    <span style={{fontSize:sFs(1.9),fontWeight:900,color:TAC+"88",width:"20%",flexShrink:0}}>{f.label}</span>
                                    <span style={{fontSize:sFs(2.3),fontWeight:700,color:"rgba(255,255,255,0.75)",flex:1}}>{f.value}</span>
                                  </div>
                                ))}
                              </>)}
                            </div>
                              );
                            })()}

                            {motm&&home>=away&&<div style={{flexShrink:0,margin:"2% 4%",background:`linear-gradient(135deg,${thex(TAC,0.12)},${thex(TAC2||TAC,0.08)})`,border:`1px solid ${thex(TAC,0.25)}`,borderRadius:"3%",padding:"2.5% 3.5%",display:"flex",alignItems:"center",gap:"3%"}}><span style={{fontSize:"5cqw"}}>🏆</span><div><div style={{fontSize:"2.2cqw",fontWeight:900,letterSpacing:1.5,color:`${TAC2||TAC}cc`,textTransform:"uppercase"}}>Man of the Match</div><div style={{fontSize:"3.5cqw",fontWeight:900,color:"#fff"}}>{motm}</div></div></div>}
                            {(igHandle||fbHandle)&&<div style={{flexShrink:0,margin:"0 4% 2%",display:"flex",alignItems:"center",gap:"3%",flexWrap:"wrap"}}>
                              {igHandle&&<div style={{display:"flex",alignItems:"center",gap:"1.5%"}}><img src={IG_ICON} alt="" style={{width:"2.5%",borderRadius:"20%"}}/><span style={{fontSize:"2cqw",color:"rgba(255,255,255,0.35)"}}>{igHandle}</span></div>}
                              {fbHandle&&<div style={{display:"flex",alignItems:"center",gap:"1.5%"}}><img src={FB_ICON} alt="" style={{width:"2.5%",borderRadius:"20%"}}/><span style={{fontSize:"2cqw",color:"rgba(255,255,255,0.35)"}}>{fbHandle}</span></div>}
                            </div>}
                            <div style={{flexShrink:0,background:"rgba(0,0,0,0.55)",borderTop:`3px solid ${TAC}`}}>{storySponsors.length>0&&(<><div style={{fontSize:"1.8cqw",fontWeight:900,letterSpacing:1.5,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",textAlign:"center",padding:"1.5% 0 1%"}}>Onze sponsors</div><div style={{display:"flex",gap:"2%",padding:"0 3% 2%",justifyContent:"center",flexWrap:"wrap"}}>{storySponsors.map((s,i)=><div key={i} style={{width:"18%",flexShrink:0,borderRadius:"6%",padding:"0.7%",background:tierGradient(s),boxShadow:`0 1px 4px rgba(0,0,0,0.3)`}}><div style={{width:"100%",height:"100%",background:"#e8e8e8",borderRadius:"4%",padding:"2% 2%",boxSizing:"border-box",display:"flex",alignItems:"center",justifyContent:"center"}}>{s.url?<img src={s.url} style={{width:"100%",height:"auto",maxHeight:15,objectFit:"contain"}} crossOrigin="anonymous"/>:<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"2.25cqw",fontWeight:900,color:"#222"}}>{s.name}</span>}</div></div>)}</div></>)}</div>
                          </div>
                        </div>
                        )}
                        {l.id==="motm" && (
                        <div style={{width:"100%",aspectRatio:"9/16",containerType:"inline-size",background:TBG,position:"relative",fontFamily:"'Barlow Condensed',sans-serif",overflow:"hidden"}}>
                          {renderPattern(0.9)}
                          <div style={{position:"absolute",top:"48%",left:"50%",transform:"translate(-50%,-50%)",fontSize:"40cqw",opacity:0.04,lineHeight:1,pointerEvents:"none"}}>🏆</div>
                          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3% 4% 0",flexShrink:0}}>
                              <div style={{display:"flex",alignItems:"center",gap:"2%"}}>
                                {(hvLogoUrl||logo)?<img src={hvLogoUrl||logo} style={{width:"7%",aspectRatio:"1/1",objectFit:"contain",background:"#fff",borderRadius:"12%",padding:"0.5%"}} crossOrigin="anonymous"/>:<div style={{width:"7%",aspectRatio:"1/1",background:thex(TAC,0.2),borderRadius:"12%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.5cqw",fontWeight:900,color:TAC}}>{clubName.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>}
                                <span style={{fontSize:(clubName.length>22?"2.2cqw":clubName.length>16?"2.5cqw":"2.8cqw"),fontWeight:900,letterSpacing:1,color:"rgba(255,255,255,0.8)"}}>{clubName}</span>
                              </div>
                              <span style={{fontSize:"2cqw",color:"rgba(255,255,255,0.2)"}}>Matchly</span>
                            </div>
                            {/* MOTM-sponsor — bovenaan, boven matchup */}
                            {motmSponsor && motmSponsor.name ? (
                              <div style={{textAlign:"center",marginTop:"2%",padding:"0 4%",flexShrink:0}}>
                                <div style={{fontSize:"2cqw",fontWeight:900,letterSpacing:3,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",marginBottom:"1.2%"}}>MOTM is mogelijk gemaakt door:</div>
                                <div style={{display:"inline-flex",alignItems:"center",gap:"2.5%",justifyContent:"center",background:"rgba(0,0,0,0.35)",borderRadius:"14px",padding:"1.5% 4%",border:`1px solid ${thex(TAC,0.25)}`}}>
                                  {motmSponsor.url && <img src={motmSponsor.url} style={{height:"5cqw",width:"auto",maxWidth:"18cqw",objectFit:"contain",background:"#fff",borderRadius:"6%",padding:"0.6%"}} crossOrigin="anonymous"/>}
                                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"3.6cqw",fontWeight:900,color:"#fff",letterSpacing:1}}>{motmSponsor.name}</span>
                                </div>
                              </div>
                            ) : (
                              <div style={{height:"1%",flexShrink:0}}></div>
                            )}
                            <div style={{
                              display:"grid",
                              gridTemplateColumns:"1fr auto 1fr",
                              alignItems:"center",
                              gap:"4%",
                              padding:"1% 4%",
                              flexShrink:0
                            }}>
                              {/* Linker team - eigen club */}
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6%"}}>
                                <div style={{width:"60%",aspectRatio:"1/1",borderRadius:"50%",border:`2.5px solid ${thex(TAC,0.7)}`,background:thex(TAC,0.12),display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 16px ${thex(TAC,0.3)}`,overflow:"hidden"}}>
                                  {(hvLogoUrl||logo)
                                    ?<img src={hvLogoUrl||logo} style={{width:"100%",height:"100%",objectFit:"contain",padding:"12%"}} crossOrigin="anonymous"/>
                                    :<div style={{fontSize:"7cqw",fontWeight:900,color:TAC}}>{clubName.replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>
                                  }
                                </div>
                                <span style={{fontSize:(clubName.length>20?"1.7cqw":clubName.length>14?"2cqw":"2.2cqw"),fontWeight:700,color:"rgba(255,255,255,0.85)",textAlign:"center",lineHeight:1.15,fontFamily:"'Barlow Condensed',sans-serif"}}>{clubName}</span>
                              </div>

                              {/* Score - centraal */}
                              <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:"2%"}}>
                                <span style={{fontSize:"16cqw",fontWeight:900,color:"rgba(255,255,255,0.95)",lineHeight:1,textShadow:`0 0 30px ${thex(TAC,0.6)}`}}>{home}</span>
                                <span style={{fontSize:"5cqw",color:"rgba(255,255,255,0.3)",lineHeight:1}}>–</span>
                                <span style={{fontSize:"16cqw",fontWeight:900,color:"rgba(255,255,255,0.4)",lineHeight:1}}>{away}</span>
                              </div>

                              {/* Rechter team - tegenstander */}
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6%"}}>
                                <div style={{width:"60%",aspectRatio:"1/1",borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                                  {oppLogoUrl
                                    ?<img src={oppLogoUrl} style={{width:"100%",height:"100%",objectFit:"contain",padding:"12%"}} crossOrigin="anonymous"/>
                                    :<div style={{fontSize:"7cqw",fontWeight:900,color:"rgba(255,255,255,0.4)"}}>{(opponent||"TG").replace(/[^A-Za-z]/g,"").slice(0,2).toUpperCase()}</div>
                                  }
                                </div>
                                <span style={{fontSize:((opponent||"Tegenstander").length>20?"1.7cqw":(opponent||"Tegenstander").length>14?"2cqw":"2.2cqw"),fontWeight:700,color:"rgba(255,255,255,0.55)",textAlign:"center",lineHeight:1.15,fontFamily:"'Barlow Condensed',sans-serif"}}>{opponent||"Tegenstander"}</span>
                              </div>
                            </div>
                            <div style={{display:"flex",justifyContent:"center",marginTop:"2%",flexShrink:0}}>
                              <div style={{width:"18%",aspectRatio:"1/1",borderRadius:"50%",background:`linear-gradient(135deg,${TAC},${TAC2||TAC})`,padding:"2%",boxShadow:`0 0 30px ${thex(TAC,0.5)}`,animation:"trophyGlow 2.4s ease-in-out infinite",perspective:"200px"}}>
                                <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8cqw",animation:"trophySpin 3.6s linear infinite",transformStyle:"preserve-3d"}}>🏆</div>
                              </div>
                            </div>
                            {/* Pakkende quote onder beker, boven naam */}
                            <div style={{textAlign:"center",marginTop:"2.5%",padding:"0 6%",flexShrink:0}}>
                              <div style={{display:"inline-block",fontFamily:"'Barlow Condensed',sans-serif",fontSize:"3.6cqw",fontStyle:"italic",fontWeight:700,color:`${TAC}ee`,lineHeight:1.35,maxWidth:"95%",textShadow:`0 0 8cqw ${thex(TAC,0.25)}`}}>
                                <span style={{color:TAC,fontSize:"5.5cqw",fontWeight:900,verticalAlign:"middle",marginRight:"0.25em"}}>"</span>
                                {getMotmQuote(motmRedenen, motm)}
                                <span style={{color:TAC,fontSize:"5.5cqw",fontWeight:900,verticalAlign:"middle",marginLeft:"0.15em"}}>"</span>
                              </div>
                            </div>
                            <div style={{textAlign:"center",padding:"2% 8%",flex:1,display:"flex",flexDirection:"column",justifyContent:"center"}}>
                              {(()=>{const n=(motm||"").length;const fs=n>20?"9cqw":n>16?"11cqw":n>12?"13cqw":"15cqw";
                              return <div style={{fontSize:fs,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",
                              lineHeight:1.05,
                              color:TAC,
                              textShadow:`0 0 12px ${thex(TAC,0.6)}, 0 0 24px ${thex(TAC,0.35)}, 0 2px 4px rgba(0,0,0,0.5)`
                              }}>{motm||"—"}</div>;})()} 
                              <div style={{display:"flex",justifyContent:"center",marginTop:"3%"}}>
                                <div style={{display:"inline-block",background:`linear-gradient(90deg,${TAC},${TAC2||TAC})`,color:"#000",
                                fontWeight:900,fontSize:"2.4cqw",letterSpacing:2,textTransform:"uppercase",padding:"1% 5%",borderRadius:3}}>Man of the Match</div>
                              </div>
                              <div style={{fontSize:(fullTeamName.length>30?"1.5cqw":fullTeamName.length>22?"1.7cqw":"2cqw"),color:`${TAC}88`,letterSpacing:1,fontWeight:700,marginTop:"1.5%",textTransform:"uppercase",textAlign:"center"}}>{fullTeamName}</div>
                              <div style={{fontSize:(((opponent||"Tegenstander").length>20)?"1.7cqw":"2cqw"),color:"rgba(255,255,255,0.3)",marginTop:"1%"}}>{home>away?"Gewonnen":home===away?"Gelijkspel":"Verloren"} · {home}-{away} vs {opponent||"Tegenstander"}</div>
                            </div>
                            <div style={{flexShrink:0,background:"rgba(0,0,0,0.55)",borderTop:`3px solid ${TAC}`}}>{storySponsors.length>0&&(<><div style={{fontSize:"1.8cqw",fontWeight:900,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",textAlign:"center",padding:"1.5% 0 1%"}}>Mede mogelijk gemaakt door onze trouwe sponsors</div><div style={{display:"flex",gap:"2%",padding:"0 3% 2%",justifyContent:"center",flexWrap:"wrap"}}>{storySponsors.map((s,i)=><div key={i} style={{width:"18%",flexShrink:0,borderRadius:"7%",padding:"0.7%",background:tierGradient(s),boxShadow:`0 1px 4px rgba(0,0,0,0.3)`}}><div style={{width:"100%",height:"100%",background:"#e8e8e8",borderRadius:"5%",padding:"2% 2%",boxSizing:"border-box",display:"flex",alignItems:"center",justifyContent:"center"}}>{s.url?<img src={s.url} style={{width:"100%",height:"auto",maxHeight:20,objectFit:"contain"}} crossOrigin="anonymous"/>:<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"2.25cqw",fontWeight:900,color:"#222"}}>{s.name}</span>}</div></div>)}</div></>)}</div>
                          </div>
                        </div>
                        )}
                      </div>
                      <button onClick={async()=>{
                        const h2c=await loadH2C();
                        const el=document.getElementById(`layout-${l.id}`);
                        if(!el) return;
                        const canvas=await h2c(el,{scale:2,useCORS:true,backgroundColor:null,logging:false,allowTaint:true});
                        const link=document.createElement("a");
                        link.download=`${clubName.replace(/\s/g,"_")}_${home}-${away}_${l.id}.png`;
                        link.href=canvas.toDataURL("image/png");
                        link.click();
                      }} style={{width:"100%",padding:"13px",background:M.gradD,border:"none",borderRadius:100,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,cursor:"pointer",letterSpacing:1,boxShadow:`0 6px 22px ${hex(M.purple,0.4)}`}}>
                        📸 {l.name} opslaan
                      </button>
                    </div>
                  ))}
                </div>

                {/* ══ STUUR NAAR BEHEERDER ══ */}
                {(()=>{
                  const hasSome = someNumber && someNumber.length >= 8;
                  const goals = events.filter(e=>e.type==="GOAL"||e.type==="OWN");
                  let hs=0,as=0;
                  const goalLines = goals.map(e=>{
                    if(e.type==="OWN") as++; else hs++;
                    return `${e.minute||"?"}' (${hs}-${as}) ${e.type==="OWN"?(opponent||"Tegenstander"):(e.player||"—")}`;
                  });
                  const greeting = someName ? `Hoi ${someName.split(" ")[0]}` : "Hoi";
                  const msgText = [
                    `${greeting}! 👋`,``,
                    `De content voor *${clubName} ${home}-${away} ${opponent||"Tegenstander"}* staat klaar.`,``,
                    `📧 Alles staat in je mail: het verslag, de caption${motm&&home>=away?`, de Man of the Match (*${motm}*)`:""} en de afbeeldingen als bijlage.`,``,
                    `Laat even weten wanneer het geplaatst is. Groet! 🙌`,
                  ].join("\n");
                  const waUrl = hasSome ? `https://wa.me/${someCountry}${someNumber}?text=${encodeURIComponent(msgText)}` : null;

                  const downloadLayout = async (id) => {
                    const h2c = await loadH2C();
                    const el = document.getElementById(`layout-${id}`);
                    if(!el) return;
                    const canvas = await h2c(el,{scale:2,useCORS:true,backgroundColor:null,logging:false,allowTaint:true});
                    const link = document.createElement("a");
                    link.download = `${clubName.replace(/\s/g,"_")}_${home}-${away}_${id}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                  };

                  // E-mail het hele pakket (verslag + afbeeldingen als bijlage) via Resend
                  const emailToBeheerder = async () => {
                    if (!someEmail) { setScreen("club"); setClubSection("distributie"); return; }
                    setMailStatus("sending");
                    try {
                      const h2c = await loadH2C();
                      const ids = ["classic","story",...(motm&&home>=away?["motm"]:[])];
                      const attachments = [];
                      for (const id of ids) {
                        const el = document.getElementById(`layout-${id}`);
                        if (!el) continue;
                        const canvas = await h2c(el,{scale:2,useCORS:true,backgroundColor:null,logging:false,allowTaint:true});
                        const dataUrl = canvas.toDataURL("image/png");
                        attachments.push({ filename:`${clubName.replace(/\s/g,"_")}_${home}-${away}_${id}.png`, content: dataUrl.split(",")[1] });
                      }
                      const gls = events.filter(e=>e.type==="GOAL"||e.type==="OWN").map(e=>formatMinuut(e.minute,e.extra,e.half)+" "+(e.type==="OWN"?(opponent||"Teg."):(e.player||"—"))).join("<br>")||"Geen doelpunten";
                      const html = `<div style="font-family:Arial,sans-serif;color:#111;line-height:1.5"><h2 style="margin:0 0 8px">${clubName} ${home}-${away} ${opponent||""}</h2><p style="font-weight:bold;font-size:16px">${aiOut.headline||""}</p><p>${(aiOut.verslag||"").replace(/\n/g,"<br>")}</p><hr><p><strong>Doelpunten:</strong><br>${gls}</p>${motm&&home>=away?`<p><strong>Man of the Match:</strong> ${motm}</p>`:""}<p style="color:#888;font-size:12px">De afbeeldingen zitten als bijlage bij deze e-mail.<br>Verstuurd via Matchly</p></div>`;
                      const subject = `Wedstrijdverslag: ${clubName} ${home}-${away} ${opponent||"Tegenstander"}`;
                      const res = await fetch("/.netlify/functions/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:someEmail,subject,html,attachments})});
                      const d = await res.json().catch(()=>({}));
                      if (!res.ok) throw new Error(d.error||"Versturen mislukt");
                      setMailStatus("ok");
                      setTimeout(()=>setMailStatus(null),4000);
                    } catch(e) {
                      setMailStatus("error:"+(e.message||"onbekend"));
                    }
                  };

                  return (
                    <div style={{background:`linear-gradient(135deg,rgba(168,85,247,0.07),rgba(168,85,247,0.02))`,border:"1px solid rgba(168,85,247,0.25)",borderRadius:20,padding:18,marginBottom:20}}>

                      {/* Header */}
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                        <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#a855f7,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 14px rgba(168,85,247,0.4)"}}>
                          <span style={{fontSize:20}}>📤</span>
                        </div>
                        <div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:T.text,letterSpacing:0.3}}>Stuur naar beheerder</div>
                          <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginTop:1}}>
                            {hasSome ? `→ ${someName||`+${someCountry}${someNumber}`}` : "Stel beheerder in via Clubinstellingen"}
                          </div>
                        </div>
                      </div>

                      {/* Stap 1: afbeeldingen downloaden */}
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,letterSpacing:2,color:"rgba(168,85,247,0.85)",textTransform:"uppercase",marginBottom:8}}>Stap 1 — Afbeeldingen downloaden</div>
                        <div style={{display:"flex",flexDirection:"column",gap:7}}>
                          <button onClick={()=>downloadLayout("classic")} style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:0.5,display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
                            <span>📸</span><span>Wedstrijdkaart (1:1)</span>
                          </button>
                          <button onClick={()=>downloadLayout("story")} style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:0.5,display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
                            <span>📱</span><span>Story (9:16)</span>
                          </button>
                          {motm&&home>=away&&(
                            <button onClick={()=>downloadLayout("motm")} style={{width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:0.5,display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
                              <span>🏆</span><span>Man of the Match (1:1)</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stap 2: kopiëren + mailen naar beheerder (content in de mail) */}
                      <div>
                        <div style={{fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,letterSpacing:2,color:"rgba(168,85,247,0.85)",textTransform:"uppercase",marginBottom:8}}>Stap 2 — Bericht naar beheerder mailen</div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{navigator.clipboard.writeText(msgText);setCopiedDistr("handover");setTimeout(()=>setCopiedDistr(null),2500);}} style={{flex:1,padding:"11px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:T.text2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,textTransform:"uppercase"}}>
                            {copiedDistr==="handover"?"✓ Gekopieerd":"📋 Kopiëren"}
                          </button>
                          <button onClick={emailToBeheerder} disabled={mailStatus==="sending"} style={{flex:2,background:someEmail?(mailStatus==="sending"?"rgba(255,255,255,0.06)":"linear-gradient(90deg,#4f46e5,#a855f7,#ec4899)"):"rgba(255,255,255,0.05)",borderRadius:10,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:7,cursor:mailStatus==="sending"?"wait":"pointer",border:someEmail&&mailStatus!=="sending"?"none":"1px solid rgba(255,255,255,0.1)"}}>
                            <span style={{fontSize:16}}>📧</span>
                            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,color:someEmail&&mailStatus!=="sending"?"#fff":T.text3,letterSpacing:0.5}}>
                              {mailStatus==="sending"?"Versturen…":someEmail?"Stuur naar SoMe":"E-mail instellen"}
                            </span>
                          </button>
                        </div>
                        {mailStatus==="ok" && <div style={{marginTop:8,fontSize:11,color:"#34d399",fontFamily:"Barlow,sans-serif",fontWeight:700}}>✓ Verstuurd naar {someEmail}</div>}
                        {typeof mailStatus==="string" && mailStatus.startsWith("error:") && <div style={{marginTop:8,fontSize:11,color:"#f87171",fontFamily:"Barlow,sans-serif"}}>✗ {mailStatus.slice(6)}</div>}
                        <div style={{marginTop:10,fontSize:10.5,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.55}}>
                          📧 Het verslag en de content staan in de mail; de afbeeldingen zitten als bijlage.
                        </div>
                      </div>

                      {/* Stap 3: of versturen via WhatsApp */}
                      <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                        <div style={{fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,letterSpacing:2,color:"rgba(168,85,247,0.85)",textTransform:"uppercase",marginBottom:8}}>Stap 3 — Of: versturen via WhatsApp</div>
                        <button onClick={()=>{if(!hasSome){setScreen("club");setClubSection("distributie");return;}window.open(waUrl,"_blank");}} style={{width:"100%",background:hasSome?"linear-gradient(90deg,#4f46e5,#a855f7,#ec4899)":"rgba(255,255,255,0.05)",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:7,cursor:"pointer",border:hasSome?"none":"1px solid rgba(255,255,255,0.1)"}}>
                          <span style={{fontSize:16}}>{hasSome?"💬":"⚙️"}</span>
                          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,color:hasSome?"#fff":T.text3,letterSpacing:0.5}}>
                            {hasSome?"Stuur via WhatsApp":"Beheerder instellen"}
                          </span>
                        </button>
                        <div style={{marginTop:10,fontSize:10.5,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.55}}>
                          💡 Stuur daarna de gedownloade afbeeldingen apart in dezelfde WhatsApp-chat.
                        </div>
                      </div>
                    </div>
                  );
                })()}

                                {/* Instagram caption — bij Match Post */}
                <div style={{background:T.bg2,border:`1px solid ${T.border2}`,borderRadius:14,padding:"14px 16px",marginBottom:4}}>
                  <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>📸 Instagram caption</div>
                  <div style={{fontSize:13,color:T.text3,lineHeight:1.7,fontFamily:"Barlow,sans-serif",marginBottom:12}}>{aiOut.instagram}</div>
                  <button onClick={()=>cp(aiOut.instagram,"ig")} style={{width:"100%",padding:"11px",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border2}`,borderRadius:12,color:T.text3,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
                    {copied==="ig"?"✓ Gekopieerd":"📋 Caption kopiëren"}
                  </button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,margin:"24px 0 10px"}}>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,${thex(TAC,0.4)},transparent)`}}/>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:900,letterSpacing:3,color:`${TAC}99`,textTransform:"uppercase"}}>Wedstrijdverslag</span>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,transparent,${thex(TAC,0.4)})`}}/>
                </div>

                {/* Verslag — v24 stijl */}
                <div style={{background:"#0c0c18",borderRadius:14,overflow:"hidden",marginBottom:4,boxShadow:"0 12px 40px rgba(0,0,0,0.7)",fontFamily:"Barlow,sans-serif"}}>
                  {/* Header met gradient + headline + score box */}
                  <div style={{background:"linear-gradient(160deg,#0a0a14,#13131f)",position:"relative",padding:"20px 22px 16px",overflow:"hidden"}}>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${TAC},${TAC2})`}}/>
                    {/* Patroon uit thema, gedimd */}
                    <div style={{opacity:0.5}}>{renderPattern(0.5)}</div>
                    <div style={{position:"relative",zIndex:2}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:900,letterSpacing:2.5,color:`${TAC}cc`,textTransform:"uppercase"}}>{teamLabel||clubName}</span>
                        <span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>·</span>
                        <span style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>{new Date().toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>
                      </div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",lineHeight:1.1,marginBottom:12}}>
                        <span style={{color:"#fff",textShadow:`0 0 14px ${thex(TAC,0.55)}, 0 0 28px ${thex(TAC,0.25)}`}}>"{aiOut.headline}"</span>
                      </div>
                      <div style={{display:"flex",alignItems:"stretch",background:"rgba(0,0,0,0.35)",borderRadius:10,overflow:"hidden"}}>
                        <div style={{flex:1,padding:"10px 14px"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,color:"#fff"}}>{clubName}</div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginTop:1}}>{loc==="thuis"?"Thuis":"Uit"}</div>
                        </div>
                        <div style={{padding:"10px 18px",background:`linear-gradient(135deg,${thex(TAC,0.1)},${thex(TAC2,0.07)})`,borderLeft:`2px solid ${thex(TAC,0.2)}`,borderRight:`2px solid ${thex(TAC2,0.2)}`,display:"flex",alignItems:"center"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:"#fff",lineHeight:1}}>
                            <span style={{color:TAC}}>{home}</span>
                            <span style={{color:"rgba(255,255,255,0.2)",margin:"0 4px"}}>–</span>
                            <span style={{color:"rgba(255,255,255,0.45)"}}>{away}</span>
                          </div>
                        </div>
                        <div style={{flex:1,padding:"10px 14px",textAlign:"right"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,color:"rgba(255,255,255,0.5)"}}>{opponent||"Tegenstander"}</div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:1}}>{loc==="thuis"?"Uit":"Thuis"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{padding:"20px 22px"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:900,letterSpacing:2.5,color:`${TAC}cc`,textTransform:"uppercase",marginBottom:10}}>📝 Wedstrijdverslag</div>
                    <p style={{fontSize:13.5,color:"rgba(255,255,255,0.8)",lineHeight:1.85,margin:0}}>{aiOut.verslag}</p>

                    <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",margin:"20px 0"}}/>

                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:900,letterSpacing:2.5,color:`${TAC}cc`,textTransform:"uppercase",marginBottom:10}}>⚽ Scoreverloop</div>
                    <div style={{display:"flex",flexDirection:"column",gap:3}}>
                      {(()=>{
                        const goals=events.filter(e=>e.type==="GOAL"||e.type==="OWN");
                        let hs=0,as=0;
                        return goals.map((g,i)=>{
                          if(g.type==="OWN") as++; else hs++;
                          const sc=`${hs}-${as}`;
                          const inH1=g.half===1||(g.minute && parseInt(g.minute)<=45);
                          return (
                            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:i%2===0?"rgba(255,255,255,0.025)":"transparent",borderRadius:7,borderLeft:`2px solid ${inH1?thex(TAC,0.35):thex(TAC2,0.35)}`}}>
                              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,color:inH1?TAC:TAC2,width:32,textAlign:"right",flexShrink:0}}>{g.minute}'</span>
                              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,color:"rgba(255,255,255,0.25)",width:32,fontWeight:700,flexShrink:0}}>{sc}</span>
                              <span style={{fontSize:16,flexShrink:0}}>⚽</span>
                              <span style={{fontSize:13,color:"rgba(255,255,255,0.8)",fontWeight:600}}>{g.type==="OWN"?`${opponent||"Tegenstander"}`:(g.player||"—")}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {(sponsors.length>0 || silverSponsors.length>0 || teamSponsors.length>0) && <>
                      <div style={{borderBottom:"1px solid rgba(255,255,255,0.06)",margin:"20px 0"}}/>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:900,letterSpacing:2,color:"rgba(255,255,255,0.25)",textTransform:"uppercase",textAlign:"center",marginBottom:10}}>Mede mogelijk gemaakt door onze trouwe sponsors</div>
                      <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                        {storySponsors.map((s,i)=>(
                          <div key={i} style={{borderRadius:9,padding:"2px",background:tierGradient(s),boxShadow:`0 1px 4px rgba(0,0,0,0.3)`}}>
                            <div style={{background:"#e8e8e8",borderRadius:7,padding:"6px 14px",display:"flex",alignItems:"center"}}>
                            {s.url
                              ? <img src={s.url} style={{height:18,maxWidth:60,objectFit:"contain"}} crossOrigin="anonymous"/>
                              : <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:900,color:"#222"}}>{s.name||"—"}</span>
                            }
                            </div>
                          </div>
                        ))}
                      </div>
                    </>}

                    <div style={{display:"flex",gap:8,marginTop:18}}>
                      <button onClick={()=>cp(aiOut.verslag,"vs")} style={{flex:1,padding:"13px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"rgba(255,255,255,0.7)",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
                        {copied==="vs"?"✓ Gekopieerd":"📋 Kopiëren"}
                      </button>
                      <button onClick={()=>{
                        const sub=encodeURIComponent("Wedstrijdverslag: "+clubName+" "+home+"-"+away+" "+(opponent||"Tegenstander"));
                        const gls=events.filter(e=>e.type==="GOAL"||e.type==="OWN").map(e=>formatMinuut(e.minute,e.extra,e.half)+" "+(e.type==="OWN"?(opponent||"Teg."):(e.player||"—"))).join("\n")||"Geen doelpunten";
                        const bod=encodeURIComponent(aiOut.headline+"\n\n"+aiOut.verslag+"\n\n---\nDoelpunten:\n"+gls+(motm&&home>=away?"\n\nMan of the Match: "+motm:"")+"\n\nVerstuurd via Matchly");
                        window.open("mailto:?subject="+sub+"&body="+bod,"_blank");
                        toggleCheck("mail");
                      }} style={{flex:1,padding:"13px",background:hex(U,0.12),border:"1px solid "+hex(U,0.3),borderRadius:12,color:U,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        <span>📧</span><span>Verstuur per mail</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── SECTION LABEL ── */}
                <div style={{display:"flex",alignItems:"center",gap:8,margin:"24px 0 10px"}}>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,${thex(TAC,0.4)},transparent)`}}/>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:900,letterSpacing:3,color:`${TAC}99`,textTransform:"uppercase"}}>WhatsApp Deelbericht</span>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,transparent,${thex(TAC,0.4)})`}}/>
                </div>

                {/* WhatsApp — v24 stijl */}
                {(()=>{
                  const goals=events.filter(e=>e.type==="GOAL"||e.type==="OWN");
                  let hs=0,as=0;
                  const goalLines=goals.map(e=>{
                    if(e.type==="OWN") as++; else hs++;
                    return `${e.minute||"?"}' (${hs}-${as}) ${e.type==="OWN"?`${opponent||"Tegenstander"}`:(e.player||"—")}`;
                  });
                  const waLines=[
                    `🏆 *${clubName} ${home}-${away} ${opponent||"Tegenstander"}*`,
                    `📅 ${fullTeamName}`,
                    ``,
                    `"${aiOut.headline}"`,
                    ``,
                    aiOut.samenvatting,
                    ``,
                    `⚽ *Doelpunten:*`,
                    ...goalLines,
                    motm?``:undefined,
                    motm?`🏆 *Man of the Match: ${motm}*`:undefined,
                    nextGame?``:undefined,
                    nextGame?`📅 *Volgende wedstrijd:*`:undefined,
                    nextGame?nextGame:undefined,
                    ``,
                    `📄 Lees het volledige verslag op onze website`,
                    igHandle?`📸 Volg ons op Instagram: ${igHandle}`:undefined,
                    fbHandle?`👍 Like ons op Facebook: ${fbHandle}`:undefined,
                  ].filter(l=>l!==undefined);
                  const waText=waLines.filter(l=>l!=="").join("\n").replace(/\*/g,"*");
                  return (
                    <div style={{background:"#0a0a0a",borderRadius:14,overflow:"hidden",boxShadow:"0 8px 30px rgba(0,0,0,0.6)",fontFamily:"Barlow,sans-serif",marginBottom:24}}>
                      {/* WhatsApp header */}
                      <div style={{background:"#1a1a2e",padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:thex(TAC,0.13),border:`2px solid ${thex(TAC,0.27)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,overflow:"hidden"}}>
                          {(hvLogoUrl||logo)?<img src={hvLogoUrl||logo} style={{width:"100%",height:"100%",objectFit:"contain",background:"#fff"}}/>:<span>⚽</span>}
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:13,color:"#fff"}}>{fullTeamName}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>WhatsApp Groep</div>
                        </div>
                      </div>
                      {/* Message bubble */}
                      <div style={{background:"#111827",padding:"16px 12px"}}>
                        <div style={{background:"#1a1230",borderRadius:"12px 12px 12px 4px",padding:"10px 12px",maxWidth:"88%",borderLeft:"3px solid #a855f7"}}>
                          {waLines.map((line,i)=>{
                            const bold=line.startsWith("*")&&line.endsWith("*");
                            const isInsta=line.startsWith("📸");
                            const isFb=line.startsWith("👍");
                            if(isInsta) return (
                              <div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:0}}>
                                <img src={IG_ICON} alt="ig" style={{width:14,height:14,borderRadius:3,flexShrink:0}}/>
                                <span style={{fontSize:12,color:"#cccccc"}}>Volg ons op Instagram: {igHandle}</span>
                              </div>
                            );
                            if(isFb) return (
                              <div key={i} style={{display:"flex",alignItems:"center",gap:5,marginBottom:0}}>
                                <img src={FB_ICON} alt="fb" style={{width:14,height:14,borderRadius:3,flexShrink:0}}/>
                                <span style={{fontSize:12,color:"#cccccc"}}>Like ons op Facebook: {fbHandle}</span>
                              </div>
                            );
                            return <div key={i} style={{fontSize:12,lineHeight:1.65,color:bold?"#fff":"#cccccc",fontWeight:bold?700:400,marginBottom:line===""?5:0}}>{line.replace(/\*/g,"")||"\u00A0"}</div>;
                          })}
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",textAlign:"right",marginTop:6}}>{new Date().toLocaleTimeString("nl-NL",{hour:"2-digit",minute:"2-digit"})} ✓✓</div>
                        </div>
                        <div style={{display:"flex",gap:8,marginTop:14}}>
                          <button onClick={()=>cp(waText,"wa")} style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
                            {copied==="wa"?"✓ Gekopieerd":"📋 Kopiëren"}
                          </button>
                          <button onClick={()=>{window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`,"_blank");}} style={{flex:1.5,background:`linear-gradient(90deg,${TAC},${TAC2})`,borderRadius:10,padding:"10px 16px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",border:"none"}}>
                            <span style={{fontSize:14}}>📤</span>
                            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900,color:"#fff",letterSpacing:1,textTransform:"uppercase"}}>Deel via WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ══════════════════════════════════════════
                    HANDOVER NAAR SOCIAL MEDIA-BEHEERDER
                    Bundelt alle content (caption, MOTM, samenvatting)
                    in één WhatsApp-bericht naar de SoMe-beheerder
                ══════════════════════════════════════════ */}
                <div style={{display:"flex",alignItems:"center",gap:8,margin:"30px 0 14px"}}>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,${thex(TAC,0.4)},transparent)`}}/>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:900,letterSpacing:3,color:`${TAC}99`,textTransform:"uppercase"}}>Naar Social Media-beheerder</span>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,transparent,${thex(TAC,0.4)})`}}/>
                </div>

                {(()=>{
                  const hasSome = someNumber && someNumber.length >= 8;
                  // Bouw het complete handover-bericht
                  const goals = events.filter(e=>e.type==="GOAL"||e.type==="OWN");
                  let hs=0,as=0;
                  const goalLines = goals.map(e=>{
                    if(e.type==="OWN") as++; else hs++;
                    return `${e.minute||"?"}' (${hs}-${as}) ${e.type==="OWN"?(opponent||"Tegenstander"):(e.player||"—")}`;
                  });
                  const greeting = someName ? `Hoi ${someName.split(" ")[0]}` : "Hoi";
                  const lines = [
                    `${greeting}! 👋`,
                    ``,
                    `De content voor *${clubName} ${home}-${away} ${opponent||"Tegenstander"}* is klaar om te plaatsen.`,
                    ``,
                    `━━━━━━━━━━━━━━━━━━━`,
                    `📸 *INSTAGRAM / FACEBOOK POST*`,
                    `━━━━━━━━━━━━━━━━━━━`,
                    ``,
                    aiOut.instagram,
                    ``,
                  ];
                  if (motm && home>=away) {
                    lines.push(`━━━━━━━━━━━━━━━━━━━`);
                    lines.push(`🏆 *MAN OF THE MATCH STORY*`);
                    lines.push(`━━━━━━━━━━━━━━━━━━━`);
                    lines.push(``);
                    lines.push(`⭐ Man of the Match: *${motm}*`);
                    lines.push(``);
                    lines.push(`${motm} kreeg de onderscheiding na onze ${home>away?"overwinning":"gelijkspel"} tegen ${opponent||"de tegenstander"} (${home}-${away}).`);
                    lines.push(``);
                    lines.push(`#MOTM #${clubName.replace(/[^A-Za-z0-9]/g,"")} #${team.replace(/[^A-Za-z0-9]/g,"")}`);
                    lines.push(``);
                  }
                  lines.push(`━━━━━━━━━━━━━━━━━━━`);
                  lines.push(`📰 *KORTE SAMENVATTING*`);
                  lines.push(`━━━━━━━━━━━━━━━━━━━`);
                  lines.push(``);
                  lines.push(`"${aiOut.headline}"`);
                  lines.push(``);
                  lines.push(aiOut.samenvatting);
                  lines.push(``);
                  lines.push(`━━━━━━━━━━━━━━━━━━━`);
                  lines.push(`⚽ *DOELPUNTEN*`);
                  lines.push(`━━━━━━━━━━━━━━━━━━━`);
                  if (goalLines.length > 0) {
                    goalLines.forEach(g=>lines.push(g));
                  } else {
                    lines.push(`Geen doelpunten`);
                  }
                  lines.push(``);
                  lines.push(`━━━━━━━━━━━━━━━━━━━`);
                  lines.push(`📋 *INSTRUCTIES*`);
                  lines.push(`━━━━━━━━━━━━━━━━━━━`);
                  lines.push(`• De match-afbeelding stuur ik direct hierna apart`);
                  if (motm && home>=away) lines.push(`• De MOTM-afbeelding stuur ik daarna apart`);
                  if (clubWebsite) lines.push(`• Het volledige verslag staat op ${clubWebsite}`);
                  lines.push(`• Geplaatst? Laat het even weten 🙌`);
                  const handoverText = lines.join("\n");

                  const waUrl = hasSome
                    ? `https://wa.me/${someCountry}${someNumber}?text=${encodeURIComponent(handoverText)}`
                    : null;

                  return (
                    <div style={{background:"rgba(168,85,247,0.05)",border:`1px solid rgba(168,85,247,0.22)`,borderRadius:18,padding:18,marginBottom:24}}>
                      {!hasSome && (
                        <div style={{background:"rgba(255,214,0,0.08)",border:"1px solid rgba(255,214,0,0.25)",borderRadius:12,padding:12,marginBottom:14,display:"flex",alignItems:"flex-start",gap:10}}>
                          <span style={{fontSize:18,lineHeight:1}}>⚠️</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:800,color:"#ffd600",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,marginBottom:4,textTransform:"uppercase"}}>Nog geen beheerder ingesteld</div>
                            <div style={{fontSize:11.5,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:8}}>Stel het WhatsApp-nummer van je social media-beheerder in zodat je alles in één tik kunt doorsturen.</div>
                            <button onClick={()=>{setScreen("club");setClubSection("distributie");}} style={{padding:"7px 12px",background:"rgba(255,214,0,0.15)",border:"1px solid rgba(255,214,0,0.4)",borderRadius:8,color:"#ffd600",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:1,textTransform:"uppercase"}}>→ Instellen</button>
                          </div>
                        </div>
                      )}

                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                        <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#a855f7,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 14px rgba(168,85,247,0.45)"}}>
                          <span style={{fontSize:18}}>📤</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:900,color:T.text,letterSpacing:0.3,lineHeight:1.2}}>Alles in één bericht</div>
                          <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginTop:2}}>
                            {hasSome
                              ? `Naar ${someName || `+${someCountry}${someNumber}`}`
                              : "Voor de SoMe-beheerder van je club"}
                          </div>
                        </div>
                      </div>

                      {/* Inhoud preview */}
                      <div style={{background:"rgba(0,0,0,0.35)",borderRadius:12,padding:14,marginBottom:14,maxHeight:180,overflowY:"auto"}}>
                        <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Inhoud bericht</div>
                        {[
                          ["📸","Instagram/Facebook caption"],
                          // MOTM heeft geen caption — is een story (regel weg)
                          ["📰","Headline + samenvatting"],
                          ["⚽",`Doelpunten-overzicht (${goalLines.length})`],
                          ["📋","Instructies voor plaatsing"],
                        ].filter(Boolean).map(([ic,lab],i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:9,marginBottom:6,fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.4}}>
                            <span style={{fontSize:12,opacity:0.8}}>{ic}</span><span>{lab}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{display:"flex",gap:8}}>
                        <button
                          onClick={()=>{navigator.clipboard.writeText(handoverText);setCopiedDistr("handover");setTimeout(()=>setCopiedDistr(null),2500);}}
                          style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:11,color:T.text2,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,textTransform:"uppercase"}}
                        >
                          {copiedDistr==="handover" ? "✓ Gekopieerd" : "📋 Kopiëren"}
                        </button>
                        <button
                          onClick={()=>{
                            if (!hasSome) { setScreen("club"); setClubSection("distributie"); return; }
                            window.open(waUrl,"_blank");
                          }}
                          style={{flex:1.7,background:hasSome?"linear-gradient(90deg,#4f46e5,#a855f7,#ec4899)":"rgba(255,255,255,0.05)",borderRadius:11,padding:"12px 16px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",border:hasSome?"none":"1px solid rgba(255,255,255,0.12)"}}
                        >
                          <span style={{fontSize:14}}>{hasSome?"📤":"⚙️"}</span>
                          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:900,color:hasSome?"#fff":T.text3,letterSpacing:1,textTransform:"uppercase"}}>
                            {hasSome ? "Versturen via WhatsApp" : "Beheerder instellen"}
                          </span>
                        </button>
                      </div>

                      <div style={{marginTop:12,padding:10,background:"rgba(0,0,0,0.2)",borderRadius:10,fontSize:10.5,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.55}}>
                        💡 Tip: stuur na dit bericht ook de match-afbeelding en eventueel de MOTM-afbeelding apart door in dezelfde chat — WhatsApp ondersteunt geen afbeeldingen via deellinks.
                      </div>
                    </div>
                  );
                })()}

                {/* ══════════════════════════════════════════
                    WEDSTRIJDVERSLAG VOOR DE WEBSITE
                    HTML & platte tekst, klaar voor CMS
                ══════════════════════════════════════════ */}
                <div style={{display:"flex",alignItems:"center",gap:8,margin:"6px 0 14px"}}>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,${thex(TAC,0.4)},transparent)`}}/>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:900,letterSpacing:3,color:`${TAC}99`,textTransform:"uppercase"}}>Verslag voor de website</span>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,transparent,${thex(TAC,0.4)})`}}/>
                </div>

                {(()=>{
                  // Bouw HTML & platte tekst versies van het verslag
                  const escape = (s) => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
                  const goals = events.filter(e=>e.type==="GOAL"||e.type==="OWN");
                  let hs=0,as=0;
                  const goalRows = goals.map(e=>{
                    if(e.type==="OWN") as++; else hs++;
                    const who = e.type==="OWN" ? (opponent||"Tegenstander") : (e.player||"—");
                    return `    <li><strong>${e.minute||"?"}'</strong> (${hs}-${as}) — ${escape(who)}${e.assist?` <em>(assist: ${escape(e.assist)})</em>`:""}</li>`;
                  }).join("\n");
                  const allSpRef = [...sponsors, ...teamSponsors].map(s=>s.name||"").filter(Boolean);
                  const sponsorsHtml = allSpRef.length > 0
                    ? `\n\n  <hr/>\n  <p><small><em>Mede mogelijk gemaakt door: ${allSpRef.map(n=>escape(n)).join(", ")}</em></small></p>`
                    : "";
                  const motmHtml = (motm && home>=away)
                    ? `\n\n  <p><strong>🏆 Man of the Match:</strong> ${escape(motm)}</p>`
                    : "";
                  const html = `<article class="matchly-verslag">
  <h1>${escape(aiOut.headline)}</h1>
  <p class="match-meta"><strong>${escape(clubName)} ${home}–${away} ${escape(opponent||"Tegenstander")}</strong> · ${escape(team)}${comp?` · ${escape(comp)}`:""}</p>

  <h2>Wedstrijdverslag</h2>
  <p>${escape(aiOut.verslag).replace(/\n\n/g,"</p>\n  <p>")}</p>${motmHtml}

  <h2>Doelpunten</h2>
  <ul>
${goalRows || "    <li>Geen doelpunten</li>"}
  </ul>${sponsorsHtml}
</article>`;

                  const plain = [
                    aiOut.headline,
                    "",
                    `${clubName} ${home}-${away} ${opponent||"Tegenstander"} · ${team}${comp?` · ${comp}`:""}`,
                    "",
                    "── WEDSTRIJDVERSLAG ──",
                    "",
                    aiOut.verslag,
                    (motm && home>=away) ? `\n🏆 Man of the Match: ${motm}` : "",
                    "",
                    "── DOELPUNTEN ──",
                    ...(goalRows ? goals.map(e=>{
                      // Hergebruik goalLines logica
                      const who = e.type==="OWN" ? (opponent||"Tegenstander") : (e.player||"—");
                      return `${e.minute||"?"}' — ${who}${e.assist?` (assist: ${e.assist})`:""}`;
                    }) : ["Geen doelpunten"]),
                    allSpRef.length>0 ? `\nMede mogelijk gemaakt door: ${allSpRef.join(", ")}` : "",
                  ].filter(l=>l!==undefined).join("\n");

                  return (
                    <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:18,padding:18,marginBottom:24}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                        <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${TAC},${thex(TAC,0.6)})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 14px ${thex(TAC,0.4)}`}}>
                          <span style={{fontSize:18}}>📄</span>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:900,color:T.text,letterSpacing:0.3,lineHeight:1.2}}>Klaar voor je clubwebsite</div>
                          <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginTop:2}}>
                            {clubWebsite ? clubWebsite.replace(/^https?:\/\//,"").replace(/\/$/,"") : "Plak in WordPress, Voetbalassist of Sportlink"}
                          </div>
                        </div>
                      </div>

                      {/* Preview van het verslag */}
                      <div style={{background:"#fafafa",borderRadius:12,padding:"16px 18px",marginBottom:14,maxHeight:240,overflowY:"auto",color:"#222",fontFamily:"Georgia,serif"}}>
                        <div style={{fontSize:18,fontWeight:900,color:"#111",lineHeight:1.25,marginBottom:6}}>{aiOut.headline}</div>
                        <div style={{fontSize:11,color:"#666",marginBottom:14,fontFamily:"sans-serif"}}><strong>{clubName} {home}–{away} {opponent||"Tegenstander"}</strong> {teamLabel ? ` · ${teamLabel}` : ""}{comp?` · ${comp}`:""}</div>
                        <div style={{fontSize:13,color:"#333",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{aiOut.verslag}</div>
                        {motm && home>=away && (
                          <div style={{marginTop:14,padding:"8px 12px",background:"#fff8dc",borderLeft:"3px solid #d4af37",fontSize:12,fontFamily:"sans-serif",color:"#444"}}><strong>🏆 Man of the Match:</strong> {motm}</div>
                        )}
                      </div>

                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <button
                          onClick={()=>{navigator.clipboard.writeText(html);setCopiedDistr("html");setTimeout(()=>setCopiedDistr(null),2500);}}
                          style={{padding:"12px",background:copiedDistr==="html"?hex(U,0.15):"rgba(255,255,255,0.05)",border:`1px solid ${copiedDistr==="html"?U:T.border3}`,borderRadius:11,color:copiedDistr==="html"?U:T.text2,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,textTransform:"uppercase"}}
                        >
                          {copiedDistr==="html" ? "✓ HTML gekopieerd" : "📋 Kopieer als HTML"}
                        </button>
                        <button
                          onClick={()=>{navigator.clipboard.writeText(plain);setCopiedDistr("plain");setTimeout(()=>setCopiedDistr(null),2500);}}
                          style={{padding:"12px",background:copiedDistr==="plain"?hex(U,0.15):"rgba(255,255,255,0.05)",border:`1px solid ${copiedDistr==="plain"?U:T.border3}`,borderRadius:11,color:copiedDistr==="plain"?U:T.text2,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,textTransform:"uppercase"}}
                        >
                          {copiedDistr==="plain" ? "✓ Tekst gekopieerd" : "📝 Platte tekst"}
                        </button>
                      </div>
                      <button
                        onClick={()=>{
                          const blob = new Blob([html],{type:"text/html;charset=utf-8"});
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `verslag-${(opponent||"wedstrijd").toLowerCase().replace(/[^a-z0-9]/g,"-")}-${new Date().toISOString().slice(0,10)}.html`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border3}`,borderRadius:11,color:T.text3,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,textTransform:"uppercase"}}
                      >
                        💾 Download als .html-bestand
                      </button>

                      <div style={{marginTop:12,padding:10,background:`linear-gradient(135deg,${hex(U,0.06)},${hex(U,0.02)})`,border:`1px solid ${hex(U,0.18)}`,borderRadius:10,fontSize:10.5,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.55}}>
                        💡 <strong style={{color:T.text2}}>HTML</strong> behoudt opmaak (kopjes, vet, lijsten) — plak in WordPress visual editor of CMS-HTML-veld. <strong style={{color:T.text2}}>Platte tekst</strong> werkt overal waar HTML niet wordt ondersteund.
                      </div>
                    </div>
                  );
                })()}

                {/* ══ KLAAR? NIEUWE WEDSTRIJD STARTEN ══ */}
                <div style={{margin:"32px 0 8px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,${thex(TAC,0.4)},transparent)`}}/>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:9,fontWeight:900,letterSpacing:3,color:`${TAC}99`,textTransform:"uppercase"}}>Klaar met deze wedstrijd?</span>
                  <div style={{height:1,flex:1,background:`linear-gradient(90deg,transparent,${thex(TAC,0.4)})`}}/>
                </div>
                <button onClick={()=>{ resetMatch(); window.scrollTo(0,0); }} style={{width:"100%",padding:14,background:hex(U,0.08),border:`1px solid ${hex(U,0.3)}`,borderRadius:100,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,color:U,cursor:"pointer",textTransform:"uppercase",letterSpacing:1,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <span style={{fontSize:16}}>🔄</span>
                  <span>Nieuwe wedstrijd starten</span>
                </button>
              </>)}
            </>)}

            {/* ══════════════════════════
                COMPETITIE
                BackBtn → club (not dashboard)
            ══════════════════════════ */}
            {screen==="competitie" && (<>
              <BackBtn onClick={()=>setScreen("club")} label="Club instellingen" />
              <SHead label="Stand & Programma" C={C} />
              {!hvEmbedUrl ? (
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:16,padding:20,textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:12}}>🏆</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:T.text,marginBottom:8}}>Nog geen competitie gekoppeld</div>
                  <div style={{fontFamily:"Barlow,sans-serif",fontSize:13,color:T.text4,marginBottom:16,lineHeight:1.6}}>
                    Stel de competitie-URL in via Club instellingen → Elftal (Heren 1)
                  </div>
                  <button onClick={()=>setScreen("club")} style={{padding:"12px 20px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:12,color:U,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800}}>
                    ⚙️ Naar Club instellingen
                  </button>
                </div>
              ) : (
                <div>
                  {/* URL info bar */}
                  <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:12,padding:"8px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:10,color:T.text4,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{isHeren1?team:"competitie"}</div>
                    <button onClick={()=>setScreen("club")} style={{marginLeft:8,background:"none",border:`1px solid ${T.border3}`,borderRadius:6,color:T.text4,fontSize:10,padding:"3px 8px",cursor:"pointer",fontFamily:"Barlow,sans-serif",flexShrink:0}}>Wijzig</button>
                  </div>
                  {/* Embedded HV site */}
                  <iframe src={hvEmbedUrl} style={{width:"100%",height:520,border:"none",borderRadius:16,background:T.bg2}} title="Competitie stand & programma" loading="lazy" />
                  <div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:T.text4,textAlign:"center",marginTop:8}}>
                    Automatisch bijgewerkt
                  </div>
                </div>
              )}
            </>)}

            {/* ══════════════════════════
                CLUB  ←  Complete restructure
            ══════════════════════════ */}

            {/* ══════════════════════════
                WEDSTRIJD-ARCHIEF
            ══════════════════════════ */}
            {screen==="archive" && (<>
              <BackBtn onClick={()=>setScreen("dashboard")} label="Dashboard" />
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:T.text,marginBottom:4,letterSpacing:0.5}}>📚 Wedstrijd-archief</div>
              <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:24}}>Overzicht van afgeronde wedstrijden ({archive.length})</div>

              {archive.length===0 ? (
                <div style={{textAlign:"center",padding:"60px 20px",background:"rgba(255,255,255,0.02)",border:`1px dashed ${T.border2}`,borderRadius:20}}>
                  <div style={{fontSize:48,opacity:0.15,marginBottom:14}}>📚</div>
                  <div style={{fontSize:14,color:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Nog geen wedstrijden</div>
                  <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5,maxWidth:280,margin:"0 auto"}}>Zodra je een wedstrijd hebt afgesloten verschijnt deze hier — met alle events, content en details bewaard.</div>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {archive.map(m => {
                    const result = m.home > m.away ? "W" : m.home < m.away ? "V" : "G";
                    const resultColor = result==="W" ? "#00c853" : result==="V" ? "#ff5252" : "#ffa726";
                    const isExpanded = expandedArchive === m.id;
                    const dateFmt = m.date ? new Date(m.date).toLocaleDateString("nl-NL",{day:"numeric",month:"short",year:"numeric"}) : "—";
                    return (
                      <div key={m.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:16,overflow:"hidden"}}>
                        <button onClick={()=>setExpandedArchive(isExpanded?null:m.id)} style={{width:"100%",padding:"14px 16px",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left"}}>
                          <div style={{width:36,height:36,borderRadius:10,background:hex(resultColor,0.15),border:`1px solid ${hex(resultColor,0.4)}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:resultColor,flexShrink:0}}>{result}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:800,color:T.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.club} {m.home}-{m.away} {m.opponent}</div>
                            <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginTop:2}}>{dateFmt} · {m.loc==="thuis"?"🏠 Thuis":"✈️ Uit"}{m.mKind?` · ${m.mKind}`:""}</div>
                          </div>
                          <span style={{fontSize:14,color:T.text4,flexShrink:0}}>{isExpanded?"▴":"▾"}</span>
                        </button>

                        {isExpanded && (
                          <div style={{padding:"4px 16px 16px",borderTop:`1px solid ${T.border3}`}}>
                            {/* Doelpunten + events */}
                            {m.events.length>0 && (
                              <div style={{marginTop:14}}>
                                <div style={{fontSize:9,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Events</div>
                                {m.events.map((e,i)=>(
                                  <div key={i} style={{fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",padding:"3px 0",display:"flex",gap:8}}>
                                    <span style={{color:T.text4,minWidth:36}}>{e.minute||"?"}{e.extra?"+":""}'</span>
                                    <span style={{flex:1}}>{e.type}: {e.player||e.playerOut||"—"}{e.assist?` (assist: ${e.assist})`:""}{e.reason?` — ${e.reason}`:""}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* MOTM */}
                            {m.motm && (
                              <div style={{marginTop:14,padding:"10px 12px",background:hex("#ffd700",0.06),border:"1px solid "+hex("#ffd700",0.2),borderRadius:10}}>
                                <div style={{fontSize:9,color:"#ffd700",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🏆 Man of the Match</div>
                                <div style={{fontSize:13,color:T.text,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.motm}</div>
                                {m.motmRedenen && m.motmRedenen.length>0 && <div style={{fontSize:11,color:T.text4,marginTop:3,fontFamily:"Barlow,sans-serif"}}>{m.motmRedenen.length} reden{m.motmRedenen.length===1?"":"en"}</div>}
                              </div>
                            )}

                            {/* AI Content */}
                            {m.aiOut && (
                              <div style={{marginTop:14}}>
                                {m.aiOut.headline && (
                                  <div style={{marginBottom:10}}>
                                    <div style={{fontSize:9,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Headline</div>
                                    <div style={{fontSize:13,color:T.text2,fontFamily:"Barlow,sans-serif",fontStyle:"italic",lineHeight:1.5}}>{m.aiOut.headline}</div>
                                  </div>
                                )}
                                {m.aiOut.verslag && (
                                  <div style={{marginBottom:10}}>
                                    <div style={{fontSize:9,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Verslag</div>
                                    <div style={{fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.aiOut.verslag}</div>
                                  </div>
                                )}
                                {m.aiOut.instagram && (
                                  <div style={{marginBottom:10}}>
                                    <div style={{fontSize:9,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>📸 Caption</div>
                                    <div style={{fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.aiOut.instagram}</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Delete */}
                            <button onClick={()=>{
                              if (window.confirm("Weet je zeker dat je deze wedstrijd uit het archief wilt verwijderen?")) {
                                setArchive(prev=>prev.filter(x=>x.id!==m.id));
                                setExpandedArchive(null);
                              }
                            }} style={{marginTop:14,width:"100%",padding:"9px",background:"transparent",border:`1px solid ${hex(T.red,0.3)}`,borderRadius:10,color:T.red,fontSize:11,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1,cursor:"pointer",textTransform:"uppercase"}}>
                              🗑️ Verwijderen uit archief
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>)}

            {screen==="club" && (<>

              {/* ── MAIN: Club + Team settings overview ── */}
              {clubSection==="main" && (<>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,color:T.text,marginBottom:4,letterSpacing:0.5}}>Instellingen</div>
                <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:16}}>Beheer wat centraal voor de club geldt en wat specifiek bij dit team hoort</div>

                {/* ── Tab-bar: Club / Team ── */}
                <div style={{display:"flex",gap:6,marginBottom:20,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:100,padding:5}}>
                  <button onClick={()=>setSettingsTab("club")} style={{flex:1,padding:"11px 12px",borderRadius:100,cursor:"pointer",background:settingsTab==="club"?M.gradD:"transparent",border:"none",color:settingsTab==="club"?"#fff":T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,letterSpacing:1,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:settingsTab==="club"?`0 4px 14px ${hex(M.purple,0.3)}`:"none"}}>
                    <span>🏛️</span> Club
                  </button>
                  <button onClick={()=>setSettingsTab("team")} style={{flex:1,padding:"11px 12px",borderRadius:100,cursor:"pointer",background:settingsTab==="team"?M.gradD:"transparent",border:"none",color:settingsTab==="team"?"#fff":T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,letterSpacing:1,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:settingsTab==="team"?`0 4px 14px ${hex(M.purple,0.3)}`:"none"}}>
                    <span>👕</span> Team
                  </button>
                </div>

                {/* Tab-info banner */}
                <div style={{background:settingsTab==="club"?hex(M.purple,0.07):hex(M.indigo,0.07),border:`1px solid ${settingsTab==="club"?hex(M.purple,0.22):hex(M.indigo,0.22)}`,borderRadius:14,padding:"10px 14px",marginBottom:20,fontSize:11.5,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>
                  {settingsTab==="club"
                    ? <>🏛️ <strong style={{color:T.text}}>Club-laag</strong> — centraal beheer. Wordt later via clubbeheerder-inlog gedeeld met alle teams. Hoofdsponsoren staan altijd op de content.</>
                    : <>👕 <strong style={{color:T.text}}>Team-laag</strong> — instellingen specifiek voor dit team. Teamsponsor krijgt 1 slot op de sponsorbalk; MOTM-sponsor verschijnt bovenaan de MOTM-story.</>}
                </div>

                {/* ──────────────────────────────────
                    SECTIE 1: CLUB IDENTITEIT
                ────────────────────────────────── */}
                {settingsTab==="club" && (<>
                {!teamId && (
                  <div style={{background:`linear-gradient(135deg,${hex(U,0.08)},${hex(U,0.02)})`,border:`1px solid ${hex(U,0.22)}`,borderRadius:18,padding:18,marginBottom:20}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                      <span style={{fontSize:28,lineHeight:1}}>👋</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:T.text,letterSpacing:0.5,marginBottom:6}}>Welkom bij Matchly</div>
                        <div style={{fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:10}}>
                          <strong style={{color:T.text,fontWeight:700}}>Voor optimaal gebruik: koppel je Voetbal.nl ID.</strong> Matchly laadt dan automatisch je eerstvolgende wedstrijd, tegenstander en logo. Daarna registreer je live de momenten — wij maken de content.
                        </div>
                        <button onClick={()=>setShowDemo(true)} style={{padding:"8px 14px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:100,color:U,fontSize:12,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:0.5,cursor:"pointer"}}>
                          👀 Bekijk voorbeeld
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:20,padding:20,marginBottom:20}}>
                  {/* AI consent toggle */}
                  <div style={{background:aiConsent?"rgba(255,255,255,0.02)":hex(T.red,0.05),border:`1px solid ${aiConsent?T.border3:hex(T.red,0.25)}`,borderRadius:14,padding:14,marginBottom:16}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <button onClick={()=>setAiConsent(!aiConsent)} style={{flexShrink:0,width:40,height:22,borderRadius:11,background:aiConsent?U:"#555",border:"none",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
                        <div style={{position:"absolute",top:2,left:aiConsent?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"all 0.2s"}}/>
                      </button>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:800,color:T.text,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5,marginBottom:4}}>AI-toestemming ({aiConsent?"aan":"uit"})</div>
                        <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>
                          Voor het genereren van content (verslagen, Instagram posts, etc.) en het scannen van sponsoren/spelers/wedstrijden worden de ingevoerde gegevens (incl. spelersnamen) naar Anthropic's API gestuurd. Voor amateurclubs met minderjarige spelers: vraag toestemming van ouders. Wanneer uit: AI-functies werken niet.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Volgende wedstrijd */}
                  <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:6}}>Volgende wedstrijd (komt terug op content)</div>
                  <input value={nextGame} onChange={e=>setNextGame(e.target.value)} placeholder="Zo 25 mei | 14:00 | Uit vs FC Rivieren" style={{...INP,marginBottom:10}} />
                  <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                    <button onClick={()=>nextMatchRef.current.click()} disabled={scanning} style={{flex:"1 1 45%",padding:"9px 8px",borderRadius:10,cursor:scanning?"default":"pointer",background:scanning==="nextmatch"?hex(U,0.15):"rgba(255,255,255,0.04)",border:`1px solid ${scanning==="nextmatch"?U:T.border3}`,color:scanning==="nextmatch"?U:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:0.5,opacity:scanning&&scanning!=="nextmatch"?0.5:1}}>
                      {scanning==="nextmatch"?"🔍 Scannen...":"📄 PDF / Foto"}
                    </button>
                    <button onClick={()=>setVoetbalUrl(voetbalUrl?"":"https://www.voetbal.nl/team/")} disabled={scanning} style={{flex:"1 1 45%",padding:"9px 8px",borderRadius:10,cursor:scanning?"default":"pointer",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:0.5,opacity:scanning?0.5:1}}>
                      🌐 voetbal.nl link
                    </button>
                  </div>
                  <input ref={nextMatchRef} type="file" accept="image/*,application/pdf" onChange={scanNextMatch} style={{display:"none"}} />
                  {voetbalUrl!==""&&voetbalUrl!==null&&(
                    <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border3}`,borderRadius:12,padding:12,marginTop:4}}>
                      <input value={voetbalUrl} onChange={e=>setVoetbalUrl(e.target.value)} placeholder="https://www.voetbal.nl/team/..." style={{...INP,marginBottom:8,fontSize:12}} />
                      <button onClick={fetchVoetbalNl} disabled={scanning} style={{width:"100%",padding:"10px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:10,color:U,cursor:scanning?"default":"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,letterSpacing:0.5}}>
                        {scanning==="nextmatch"?"🔍 Ophalen...":"✓ Wedstrijden ophalen"}
                      </button>
                      <div style={{fontSize:10,color:T.text4,marginTop:8,fontFamily:"Barlow,sans-serif",lineHeight:1.4}}>⚠️ Lukt het niet via de URL? Kopieer de tekst van de programmapagina hieronder:</div>
                      <textarea value={voetbalFallback} onChange={e=>setVoetbalFallback(e.target.value)} placeholder="Plak hier de tekst van de voetbal.nl pagina..." rows={3} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:10,padding:"8px 10px",color:T.text,fontFamily:"Barlow,sans-serif",fontSize:11,outline:"none",resize:"vertical",boxSizing:"border-box",marginTop:6}}/>
                      {voetbalFallback&&<button onClick={async()=>{
                        setScanning("nextmatch");setScanError(null);
                        try{
                          const res=await fetch("/.netlify/functions/anthropic",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:`Vind de eerstvolgende wedstrijd in deze tekst. Geef ALLEEN dit JSON: {"date":"Zo 25 mei","time":"14:00","opponent":"...","location":"Thuis|Uit"}\n\n${voetbalFallback}`}]})});
                          const d=await res.json();const raw=d.content?.map(b=>b.text||"").join("")||"";const out=JSON.parse(raw.replace(/```json|```/g,"").trim());
                          const parts=[out.date,out.time,out.location,out.opponent?"vs "+out.opponent:null].filter(Boolean);
                          setNextGame(parts.join(" | "));
                        }catch(e){setScanError("Mislukt: "+e.message);}
                        setScanning(null);
                      }} style={{width:"100%",marginTop:6,padding:"10px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:10,color:U,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,letterSpacing:0.5}}>✓ Tekst verwerken</button>}
                    </div>
                  )}
                </div>
                </>)}{/* einde Club-tab content */}

                {/* ──────────────────────────────────
                    SECTIE 2: ELFTAL  (Team-tab)
                ────────────────────────────────── */}
                {settingsTab==="team" && (<>
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:20,padding:20,marginBottom:20}}>
                  <div style={{fontSize:10,color:U,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",opacity:0.8,marginBottom:16}}>ELFTAL</div>

                  {teamLocked ? (
                    <div style={{padding:"14px 16px",background:hex(U,0.1),border:`1px solid ${hex(U,0.3)}`,borderRadius:12,marginBottom:16}}>
                      <div style={{fontSize:11,color:T.text3,marginBottom:3,fontFamily:"Barlow,sans-serif"}}>Je vult in voor</div>
                      <div style={{fontSize:18,fontWeight:800,color:T.text,fontFamily:"'Barlow Condensed',sans-serif"}}>{team}</div>
                    </div>
                  ) : (<>
                  {/* Team chips */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
                    {["Heren 1","Heren 2","Heren 3","Heren 4","Dames 1","Dames 2","JO19-1","JO17-1","JO15-1"].map(t=>(
                      <Chip key={t} label={t} active={team===t} onClick={()=>setTeam(t)} color={U} xs />
                    ))}
                  </div>
                  <input value={team} onChange={e=>setTeam(e.target.value)} placeholder="Of typ zelf: Heren 5" style={{...INP,marginBottom:16}} />
                  </>)}

                  {/* ── Heren 1: HollandseVelden competitie ── */}
                  {isHeren1 ? (
                    <div style={{background:"rgba(0,0,0,0.2)",border:`1px solid ${hex(U,0.2)}`,borderRadius:14,padding:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{fontSize:14}}>🏆</span>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:U,letterSpacing:0.5}}>Competitie & Programma</div>
                      </div>
                      <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:10}}>
                        Ga naar <span style={{color:U}}>hollandsevelden.nl</span> → zoek jouw competitie → kopieer de URL.
                      </div>
                      <input value={hvCompUrl} onChange={e=>setHvCompUrl(e.target.value)}
                        placeholder="https://www.hollandsevelden.nl/competities/..."
                        style={{...INP,fontFamily:"monospace",fontSize:10,marginBottom:hvEmbedUrl?10:0}} />
                      {hvEmbedUrl && (
                        <button onClick={()=>setScreen("competitie")} style={{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:12,color:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:0.5,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span>📊 Bekijk stand & programma</span>
                          <span style={{color:T.text4}}>›</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* ── Other teams: voetbal.nl ── */
                    <div style={{background:"rgba(0,0,0,0.2)",border:`1px solid ${hex(T.yellow,0.2)}`,borderRadius:14,padding:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                        <span style={{fontSize:14}}>🔗</span>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:T.yellow,letterSpacing:0.5}}>Voetbal.nl koppeling</div>
                      </div>

                      {/* Club code — once for whole club */}
                      <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:8}}>
                        <strong style={{color:T.text3}}>Clubcode</strong> (eenmalig in te stellen door de clubbeheerder via voetbal.nl):
                      </div>
                      <div style={{display:"flex",gap:8,marginBottom:12}}>
                        <input value={clubCode} onChange={e=>setClubCode(e.target.value)} placeholder="Bijv. 67890"
                          style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:10,padding:"10px 12px",color:T.text,fontFamily:"monospace",fontSize:13,outline:"none"}} />
                        {clubCode && (
                          <a href={`https://www.voetbal.nl/clubs/nederland/${clubCode}/show/`} target="_blank" rel="noopener noreferrer"
                            style={{padding:"10px 14px",background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border3}`,borderRadius:10,color:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center"}}>
                            ↗
                          </a>
                        )}
                      </div>

                      {/* Team ID for this specific team */}
                      <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:8}}>
                        <strong style={{color:T.text3}}>Team-ID</strong> voor {fullTeamName}:
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <input value={teamId} onChange={e=>setTeamId(e.target.value)} placeholder="Bijv. 122561"
                          style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:10,padding:"10px 12px",color:T.text,fontFamily:"monospace",fontSize:13,outline:"none"}} />
                        <button onClick={searchTeamId} disabled={teamIdLoading} style={{padding:"10px 14px",background:hex(U,0.1),border:`1px solid ${hex(U,0.25)}`,borderRadius:10,color:U,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,whiteSpace:"nowrap"}}>
                          {teamIdLoading?"⏳":"🔍 Zoek"}
                        </button>
                      </div>
                      {teamIdMsg && <div style={{marginTop:6,fontSize:11,color:teamId?U:T.red,fontFamily:"Barlow,sans-serif"}}>{teamIdMsg}</div>}
                      {teamId && <div style={{marginTop:6,fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif"}}>✓ Team-ID opgeslagen voor {team}</div>}

                      {/* Info button */}
                      <button onClick={()=>setShowTeamIdInfo(true)} style={{marginTop:12,background:"none",border:"none",color:T.text4,cursor:"pointer",fontFamily:"Barlow,sans-serif",fontSize:11,padding:0,textDecoration:"underline",textDecorationStyle:"dotted"}}>
                        Waar vind ik het team-ID?
                      </button>
                    </div>
                  )}
                </div>
                {/* ── SCHRIJFSTIJL — Team-laag ── */}
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:20,padding:20,marginBottom:20}}>
                  <div style={{fontSize:10,color:U,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",opacity:0.8,marginBottom:6}}>Schrijfstijl</div>
                  <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:14}}>Bepaalt de toon van wedstrijdverslagen en social posts. Per team apart opgeslagen — schakel je naar een ander team, dan onthoudt Matchly de keuze.</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {["Zakelijk & Nuchter","Stoer & Ambitieus","Jeugd & Plezier"].map(o=>(
                      <Chip key={o} label={o} active={stijl===o} onClick={()=>setStijl(o)} color={U} />
                    ))}
                  </div>
                </div>
                </>)}{/* einde Team-tab content */}

                {/* ──────────────────────────────────
                    SECTIE 3: NAV CARDS
                    Spelerslijst + Sponsoren + Archief
                ────────────────────────────────── */}
                <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",marginBottom:12,opacity:0.6}}>BEHEER</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
                  <ClubCard
                    emoji="👥"
                    label="Spelerslijst"
                    sub={squad.length > 0 ? `${squad.length} spelers` : "Nog geen spelers"}
                    badge={squad.length}
                    onClick={()=>setClubSection("spelerslijst")}
                    C={C}
                  />
                  <ClubCard
                    emoji="📚"
                    label="Wedstrijd-archief"
                    sub={archive.length > 0 ? `${archive.length} wedstrijd${archive.length===1?"":"en"} bewaard` : "Nog geen wedstrijden"}
                    badge={archive.length}
                    onClick={()=>setScreen("archive")}
                    C={C}
                  />
                  <ClubCard
                    emoji="🏅"
                    label="Sponsoren"
                    sub={(()=>{
                      const parts=[];
                      if(sponsors.length>0) parts.push(`${sponsors.length} hoofd`);
                      if(teamSponsors.length>0) parts.push(`${teamSponsors.length} team`);
                      if(motmSponsor && motmSponsor.name) parts.push("MOTM");
                      return parts.length ? parts.join(" · ") : "Nog geen sponsors";
                    })()}
                    badge={sponsors.length}
                    onClick={()=>setClubSection("sponsoren")}
                    C={C}
                  />
                  <div style={{gridColumn:"1 / -1"}}>
                    <ClubCard
                      emoji="📤"
                      label="Distributie & Communicatie"
                      sub={someNumber ? `SoMe: ${someName || "+"+someCountry+someNumber}` : "Stel SoMe-beheerder & website in"}
                      onClick={()=>setClubSection("distributie")}
                      C={C}
                    />
                  </div>
                </div>

                {/* ──────────────────────────────────
                    DANGER ZONE
                ────────────────────────────────── */}
                <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",marginBottom:12,opacity:0.6,marginTop:8}}>OPGESLAGEN DATA</div>
                <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${T.border2}`,borderRadius:14,padding:16,marginBottom:14}}>
                  <div style={{fontSize:12,color:T.text2,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:12}}>
                    💾 Maak een backup van alles (clubinstellingen, spelers, sponsors, wedstrijddata) als JSON-bestand. Handig om over te zetten naar een ander apparaat of voor browser-cleaning.
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{
                      const data={};
                      Object.keys(localStorage).filter(k=>k.startsWith("matchly_")).forEach(k=>{try{data[k]=JSON.parse(localStorage[k]);}catch{data[k]=localStorage[k];}});
                      const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),data},null,2)],{type:"application/json"});
                      const url=URL.createObjectURL(blob);
                      const a=document.createElement("a");a.href=url;a.download=`matchly-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();
                      URL.revokeObjectURL(url);
                    }} style={{flex:1,padding:"11px",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:10,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:0.5}}>📥 Exporteer backup</button>
                    <button onClick={()=>{const i=document.createElement("input");i.type="file";i.accept="application/json";i.onchange=async(e)=>{const f=e.target.files[0];if(!f)return;try{const txt=await f.text();const obj=JSON.parse(txt);const d=obj.data||obj;if(!confirm("Backup importeren? Huidige data wordt overschreven."))return;Object.keys(d).forEach(k=>{if(k.startsWith("matchly_"))localStorage.setItem(k,typeof d[k]==="string"?d[k]:JSON.stringify(d[k]));});window.location.reload();}catch(err){alert("Importeren mislukt: "+err.message);}};i.click();}} style={{flex:1,padding:"11px",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:10,color:T.text2,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:0.5}}>📤 Importeer backup</button>
                  </div>
                </div>
                {/* ──────────────────────────────────
                    HELP & FEEDBACK
                ────────────────────────────────── */}
                <div style={{background:hex(U,0.04),border:`1px solid ${hex(U,0.2)}`,borderRadius:20,padding:20,marginBottom:20}}>
                  <div style={{fontSize:10,color:U,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",opacity:0.9,marginBottom:8}}>💬 Help & Feedback</div>
                  <div style={{fontSize:13,color:T.text3,marginBottom:14,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>Een bug gevonden, idee voor verbetering, of een andere vraag? Laat het weten — elke melding helpt Matchly beter te maken.</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[
                      {kind:"bug",   emoji:"🐛", label:"Bug melden",    subject:"Matchly · Bug report"},
                      {kind:"idea",  emoji:"💡", label:"Idee delen",    subject:"Matchly · Feature idee"},
                      {kind:"vraag", emoji:"❓", label:"Vraag stellen", subject:"Matchly · Vraag"},
                    ].map(f=>(
                      <button key={f.kind} onClick={()=>{
                        const ua = typeof navigator!=="undefined"?navigator.userAgent:"?";
                        const tpl = {
                          bug:   ["Hoi Matchly team,","","Beschrijving van de bug:","[hier invullen]","","Stappen om te reproduceren:","1. ","2. ","","Verwacht: [hier invullen]","Gebeurde: [hier invullen]"],
                          idea:  ["Hoi Matchly team,","","Mijn idee:","[hier invullen]","","Waarom dit handig zou zijn:","[hier invullen]"],
                          vraag: ["Hoi Matchly team,","","Mijn vraag:","[hier invullen]"],
                        }[f.kind];
                        const body = [...tpl,"","---","App versie: matchly-v30","Device: "+ua,"Club: "+(clubName||"-")].join("\n");
                        window.location.href = `mailto:matchlycontent@gmail.com?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(body)}`;
                      }} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border2}`,borderRadius:12,cursor:"pointer",fontFamily:"Barlow,sans-serif",fontSize:13,fontWeight:600,color:T.text,textAlign:"left"}}>
                        <span style={{fontSize:18}}>{f.emoji}</span>
                        <span style={{flex:1}}>{f.label}</span>
                        <span style={{fontSize:14,color:T.text4}}>→</span>
                      </button>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:T.text4,marginTop:12,fontFamily:"Barlow,sans-serif",fontStyle:"italic"}}>Opent je standaard e-mail-app met een vooringevuld bericht. Werkt ook offline.</div>
                </div>

                {/* Danger zone */}
                <div style={{background:hex(T.red,0.04),border:`1px solid ${hex(T.red,0.18)}`,borderRadius:14,padding:16,marginBottom:24}}>
                  <div style={{fontSize:12,color:T.text2,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:12}}>
                    ⚠️ Alle lokale data wissen. Niet ongedaan te maken — exporteer eerst een backup als je twijfelt.
                  </div>
                  <button
                    onClick={()=>{
                      if (window.confirm("Weet je zeker dat je ALLE opgeslagen data wilt wissen? Dit verwijdert je clubinstellingen, spelers, sponsoren en lopende wedstrijd. Deze actie kan niet ongedaan worden gemaakt.")) {
                        clearAllMatchlyStorage();
                        window.location.reload();
                      }
                    }}
                    style={{width:"100%",padding:"12px",background:hex(T.red,0.08),border:`1px solid ${hex(T.red,0.3)}`,borderRadius:10,color:T.red,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:0.5}}
                  >
                    🗑️ Alle data wissen
                  </button>
                </div>
              </>)}

              {/* ── SPELERSLIJST sub-screen ── */}
              {clubSection==="spelerslijst" && (<>
                <BackBtn onClick={()=>setClubSection("main")} label="Club instellingen" />
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:T.text,marginBottom:20,letterSpacing:0.5}}>👥 Spelerslijst</div>

                {/* Import options */}
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                  <button onClick={()=>setImportMode(importMode==="csv"?"":"csv")} style={{flex:"1 1 45%",padding:"10px 8px",borderRadius:12,cursor:"pointer",background:importMode==="csv"?hex(U,0.15):"rgba(255,255,255,0.04)",border:`1px solid ${importMode==="csv"?U:T.border3}`,color:importMode==="csv"?U:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:0.5,transition:"all 0.18s"}}>📊 Sportlink CSV</button>
                  <button onClick={()=>setImportMode(importMode==="paste"?"":"paste")} style={{flex:"1 1 45%",padding:"10px 8px",borderRadius:12,cursor:"pointer",background:importMode==="paste"?hex(U,0.15):"rgba(255,255,255,0.04)",border:`1px solid ${importMode==="paste"?U:T.border3}`,color:importMode==="paste"?U:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:0.5,transition:"all 0.18s"}}>🌐 Voetbal.nl plakken</button>
                  <button onClick={()=>playerScanRef.current.click()} disabled={scanning} style={{flex:"1 1 45%",padding:"10px 8px",borderRadius:12,cursor:scanning?"default":"pointer",background:scanning==="players"?hex(U,0.15):"rgba(255,255,255,0.04)",border:`1px solid ${scanning==="players"?U:T.border3}`,color:scanning==="players"?U:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:0.5,opacity:scanning&&scanning!=="players"?0.5:1}}>{scanning==="players"?"🔍 Scannen...":"📸 Foto / PDF scannen"}</button>
                </div>
                <input ref={playerScanRef} type="file" accept="image/*,application/pdf" onChange={scanPlayers} style={{display:"none"}} />
                {scanError&&scanning===null&&<div style={{padding:10,background:"rgba(255,68,68,0.1)",border:"1px solid rgba(255,68,68,0.3)",borderRadius:10,color:"#ff8888",fontSize:12,marginBottom:12,fontFamily:"Barlow,sans-serif"}}>{scanError}</div>}
                {lastScanUndo&&lastScanUndo.mode==="players"&&!scanning&&!scanError&&<div style={{display:"flex",alignItems:"center",gap:10,padding:10,background:`${hex(U,0.08)}`,border:`1px solid ${hex(U,0.2)}`,borderRadius:10,marginBottom:12}}>
                  <span style={{flex:1,fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif"}}>✓ Spelers toegevoegd</span>
                  <button onClick={()=>{lastScanUndo.fn();setLastScanUndo(null);}} style={{background:"none",border:`1px solid ${T.border3}`,borderRadius:8,padding:"5px 12px",color:T.text4,fontSize:11,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:0.5}}>↶ Ongedaan</button>
                </div>}

                {importMode==="csv" && (
                  <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:16,padding:16,marginBottom:16}}>
                    <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:12}}>Exporteer via <strong style={{color:T.text3}}>Sportlink → Leden → Exporteren → CSV</strong>. Upload het bestand hieronder.</div>
                    <button onClick={()=>csvRef.current.click()} style={{width:"100%",padding:"13px",background:"rgba(255,255,255,0.04)",border:`1px dashed ${T.border3}`,borderRadius:12,color:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:0.5}}>📁 CSV bestand kiezen</button>
                    <input ref={csvRef} type="file" accept=".csv,.txt" onChange={handleCsvImport} style={{display:"none"}} />
                  </div>
                )}

                {importMode==="paste" && (
                  <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:16,padding:16,marginBottom:16}}>
                    <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:12}}>Ga naar jouw team op <strong style={{color:T.text3}}>voetbal.nl</strong>, selecteer de spelerslijst en plak de namen hieronder. Één naam per regel.</div>
                    <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"Jan de Vries\nPeter Jansen\nMike van den Berg"} rows={5}
                      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:12,padding:"12px 14px",color:T.text,fontFamily:"Barlow,sans-serif",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}} />
                    <button onClick={handlePasteImport} style={{width:"100%",marginTop:8,padding:"12px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:12,color:U,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,letterSpacing:0.5}}>✓ Spelers importeren</button>
                  </div>
                )}

                {/* Basis-info banner */}
                {squad.length>0 && (
                  <div style={{background:hex(U,0.06),border:`1px solid ${hex(U,0.18)}`,borderRadius:12,padding:"10px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:16}}>⭐</span>
                    <div style={{flex:1,fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.4}}>
                      Tik op de ster om een speler als <strong style={{color:T.text2}}>basis</strong> te markeren. Basisspelers staan bovenaan in alle dropdowns.
                    </div>
                    <span style={{fontSize:11,fontWeight:800,color:U,fontFamily:"'Barlow Condensed',sans-serif"}}>{baseSquad.length}/{squad.length}</span>
                  </div>
                )}
                {/* Player list — basis bovenaan */}
                {sortedSquad.map((p,i)=>{
                  const realIdx = squad.indexOf(p);
                  const isBase = baseSquad.includes(p);
                  return (
                  <div key={p} style={{display:"flex",alignItems:"center",gap:12,background:isBase?hex(U,0.06):"rgba(255,255,255,0.04)",border:`1px solid ${isBase?hex(U,0.25):T.border2}`,borderRadius:14,padding:"13px 14px",marginBottom:8}}>
                    <span style={{width:24,height:24,background:isBase?U:T.bg3,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:isBase?"#fff":T.text3,fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}}>{i+1}</span>
                    <span style={{flex:1,fontSize:14,color:T.text,fontFamily:"Barlow,sans-serif",fontWeight:isBase?600:400}}>{p}</span>
                    <button onClick={()=>{ if(!isBase && baseSquad.length>=11) return; toggleBase(p); }} disabled={!isBase && baseSquad.length>=11} style={{background:"none",border:"none",cursor:(!isBase && baseSquad.length>=11)?"not-allowed":"pointer",fontSize:18,lineHeight:1,padding:4,color:isBase?U:T.text4,opacity:(!isBase && baseSquad.length>=11)?0.25:1}} title={isBase?"Uit basis halen":baseSquad.length>=11?"Basis is vol (max 11)":"In basis zetten"}>{isBase?"★":"☆"}</button>
                    <button onClick={()=>{setSquad(squad.filter((_,j)=>j!==realIdx)); setBaseSquad(prev=>prev.filter(n=>n!==p));}} style={{background:"none",border:"none",color:T.text4,cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
                  </div>
                );})}
                {squad.length===0 && <Empty icon="👥" label="Nog geen spelers" />}

                <div style={{display:"flex",gap:10,marginTop:8}}>
                  <input value={newP} onChange={e=>setNewP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addP()} placeholder="Naam speler toevoegen..."
                    style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:14,padding:"13px 16px",color:T.text,fontFamily:"Barlow,sans-serif",fontSize:14,outline:"none",backdropFilter:"blur(8px)"}} />
                  <button onClick={addP} style={{padding:"13px 20px",background:U,border:"none",borderRadius:14,color:"#000",fontWeight:900,fontSize:18,cursor:"pointer",boxShadow:`0 6px 20px ${hex(U,0.35)}`}}>+</button>
                </div>
              </>)}

              {/* ── SPONSOREN sub-screen ── */}
              {clubSection==="sponsoren" && (<>
                <BackBtn onClick={()=>setClubSection("main")} label="Instellingen" />
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:T.text,marginBottom:8,letterSpacing:0.5}}>🏅 Sponsoren</div>
                <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:20}}>Beheer hier de sponsoren voor jouw team. De clubsponsoren (goud en zilver) regelt de clubbeheerder.</div>

                {/* Clubsponsoren (goud + zilver) worden centraal beheerd in de admin */}
                <div style={{background:hex(U,0.07),border:`1px solid ${hex(U,0.22)}`,borderRadius:14,padding:"14px 16px",marginBottom:24,fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.6}}>
                  🏛️ <strong style={{color:T.text}}>Clubsponsoren</strong> (goud en zilver) worden centraal beheerd door de clubbeheerder en verschijnen automatisch op je content. Hieronder beheer je je eigen <strong style={{color:T.text}}>teamsponsor</strong> en <strong style={{color:T.text}}>MOTM-sponsor</strong>.
                </div>

                {/* ── TEAMSPONSOREN — Team-laag, 1 wisselend slot ── */}
                <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border2}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:18}}>👕</span>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:T.text,letterSpacing:0.5}}>Teamsponsoren</div>
                    <span style={{fontSize:9,fontWeight:900,color:"#7dd3fc",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,padding:"2px 7px",background:"rgba(125,211,252,0.12)",border:"1px solid rgba(125,211,252,0.3)",borderRadius:6,textTransform:"uppercase"}}>Brons · 1</span>
                  </div>
                  <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:16}}>Sponsoren specifiek voor dit team. Krijgen samen één vast slot op de sponsorbalk — bij meerdere wisselt het slot automatisch door tussen alle teamsponsoren (zelfde tempo als hoofdsponsoren). Als de lijst leeg is, vult een hoofdsponsor het slot op.</div>

                  {/* Lijst van bestaande teamsponsoren */}
                  {teamSponsors.length > 0 && (
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                      {teamSponsors.map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:12,padding:"10px 12px"}}>
                          {s.url ? (
                            <div style={{background:"#fff",borderRadius:8,padding:"4px 8px",display:"inline-flex",alignItems:"center",flexShrink:0}}>
                              <img src={s.url} style={{height:24,maxWidth:64,objectFit:"contain"}} />
                            </div>
                          ) : (
                            <div style={{width:36,height:36,background:"rgba(125,211,252,0.1)",border:"1px dashed rgba(125,211,252,0.3)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>👕</div>
                          )}
                          <input
                            type="text"
                            value={s.name || ""}
                            onChange={e=>{
                              const v = e.target.value;
                              setTeamSponsors(prev => prev.map((p,j)=>j===i?{...p,name:v}:p));
                            }}
                            placeholder="Naam teamsponsor"
                            style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border3}`,borderRadius:8,padding:"8px 10px",color:T.text,fontFamily:"Barlow,sans-serif",fontSize:13,outline:"none",minWidth:0}}
                          />
                          <button onClick={()=>setTeamSponsors(prev=>prev.filter((_,j)=>j!==i))} style={{background:"#ff4444",border:"none",borderRadius:"50%",width:22,height:22,color:"#fff",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,flexShrink:0}}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {teamSponsors.length === 0 && (
                    <div style={{padding:"16px 14px",background:"rgba(255,255,255,0.02)",border:`1px dashed ${T.border3}`,borderRadius:12,color:T.text4,fontSize:12,fontFamily:"Barlow,sans-serif",lineHeight:1.5,marginBottom:14,textAlign:"center"}}>
                      Nog geen teamsponsoren · hoofdsponsoren vullen alle 5 slots
                    </div>
                  )}

                  {/* Toevoegen-knoppen */}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setTeamSponsors(prev=>[...prev,{name:"",url:null}])} style={{flex:1,padding:12,background:"rgba(255,255,255,0.04)",border:`1px dashed ${T.border3}`,borderRadius:12,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:0.5}}>
                      + Naam toevoegen
                    </button>
                    <button onClick={()=>teamSponsorRef.current.click()} style={{flex:1,padding:12,background:"rgba(255,255,255,0.04)",border:`1px dashed ${T.border3}`,borderRadius:12,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:0.5}}>
                      📁 Logo uploaden
                    </button>
                  </div>
                  <input ref={teamSponsorRef} type="file" accept="image/*" onChange={handleTeamSponsorLogo} style={{display:"none"}} />
                </div>

                {/* MOTM-sponsor — aparte sponsor specifiek voor Man of the Match story */}
                <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border2}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                    <span style={{fontSize:18}}>🏆</span>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:900,color:T.text,letterSpacing:0.5}}>MOTM-sponsor</div>
                    <span style={{fontSize:9,fontWeight:900,color:"#7dd3fc",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,padding:"2px 7px",background:"rgba(125,211,252,0.12)",border:"1px solid rgba(125,211,252,0.3)",borderRadius:6,textTransform:"uppercase"}}>Team</span>
                  </div>
                  <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:16}}>Aparte sponsor die bovenaan de Man of the Match-story verschijnt. Bijvoorbeeld een lokale slijterij, restaurant of supermarkt. Verschijnt alleen op de MOTM-afbeelding — niet in WhatsApp of verslag.</div>

                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Sponsornaam</div>
                    <input
                      type="text"
                      value={motmSponsor.name || ""}
                      onChange={e=>setMotmSponsor(prev=>({...prev,name:e.target.value}))}
                      placeholder="Bijv. Café De Hoek"
                      style={{...INP, width:"100%", boxSizing:"border-box"}}
                    />
                  </div>

                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Logo (optioneel)</div>
                    {motmSponsor.url ? (
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{background:"#fff",borderRadius:14,padding:"8px 12px",display:"inline-flex",alignItems:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.3)"}}>
                          <img src={motmSponsor.url} style={{height:32,maxWidth:96,objectFit:"contain"}} />
                        </div>
                        <button onClick={()=>setMotmSponsor(prev=>({...prev,url:null}))} style={{background:"rgba(255,68,68,0.12)",border:"1px solid rgba(255,68,68,0.3)",borderRadius:10,padding:"8px 14px",color:"#ff8888",fontSize:11,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:0.5}}>Verwijder logo</button>
                      </div>
                    ) : (
                      <button onClick={()=>motmSponsorRef.current.click()} style={{width:"100%",padding:14,background:"rgba(255,255,255,0.04)",border:`1px dashed ${T.border3}`,borderRadius:14,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:0.5}}>
                        📁 Logo uploaden
                      </button>
                    )}
                    <input ref={motmSponsorRef} type="file" accept="image/*" onChange={handleMotmSponsorLogo} style={{display:"none"}} />
                  </div>

                  {motmSponsor.name && (
                    <button onClick={()=>setMotmSponsor({name:"",url:null})} style={{width:"100%",padding:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border3}`,borderRadius:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:0.5,marginTop:4}}>
                      Wis MOTM-sponsor
                    </button>
                  )}
                </div>
              </>)}

              {/* ── DISTRIBUTIE & COMMUNICATIE ── */}
              {clubSection==="distributie" && (<>
                <button onClick={()=>setClubSection("main")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:0.5,padding:"0 0 14px 0",textTransform:"uppercase"}}>
                  <span style={{fontSize:15,lineHeight:1}}>←</span> Terug naar Club Instellingen
                </button>

                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:T.text,marginBottom:8,letterSpacing:0.5}}>📤 Distributie & Communicatie</div>
                <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:20}}>Stel hier in waar Matchly de gegenereerde content na de wedstrijd naartoe stuurt — eenmalig instellen, daarna één tik per wedstrijd.</div>

                {/* ────────────────────────────────────
                    SECTIE A: SOCIAL MEDIA BEHEERDER
                ──────────────────────────────────── */}
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:20,padding:20,marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:10,color:U,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",opacity:0.9}}>Social Media Beheerder</span>
                    {someNumber && <span style={{fontSize:9,padding:"2px 7px",background:hex(U,0.18),border:`1px solid ${hex(U,0.35)}`,borderRadius:10,color:U,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>✓ Ingesteld</span>}
                  </div>
                  <div style={{fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.55,marginBottom:16}}>De persoon die toegang heeft tot het clublogo van Instagram en Facebook. Matchly bundelt na de wedstrijd alle content en stuurt het in één bericht naar zijn WhatsApp.</div>

                  <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:6}}>Naam <span style={{color:T.text4}}>(optioneel)</span></div>
                  <input
                    value={someName}
                    onChange={e=>setSomeName(e.target.value)}
                    placeholder="bv. Mark de Boer"
                    style={{...INP,marginBottom:14}}
                  />

                  <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:6}}>WhatsApp-nummer</div>
                  <div style={{display:"grid",gridTemplateColumns:"100px 1fr",gap:8,marginBottom:8}}>
                    <select
                      value={someCountry}
                      onChange={e=>setSomeCountry(e.target.value)}
                      style={{...INP,padding:"13px 10px",cursor:"pointer"}}
                    >
                      <option value="31">🇳🇱 +31</option>
                      <option value="32">🇧🇪 +32</option>
                      <option value="49">🇩🇪 +49</option>
                      <option value="44">🇬🇧 +44</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={someNumber}
                      onChange={e=>setSomeNumber(e.target.value.replace(/[^0-9]/g,""))}
                      placeholder="612345678"
                      style={INP}
                    />
                  </div>
                  <div style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>💡 Zonder de 0 vooraan. Voor 06-12345678 vul je <strong style={{color:T.text3}}>612345678</strong> in.</div>

                  <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:6,marginTop:16}}>E-mailadres <span style={{color:T.text4}}>(voor versturen van content per mail)</span></div>
                  <input
                    type="email"
                    value={someEmail}
                    onChange={e=>setSomeEmail(e.target.value.trim())}
                    placeholder="bv. mark@club.nl"
                    style={{...INP,marginBottom:8}}
                  />
                  <div style={{fontSize:10,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>💡 Hiermee kun je na de wedstrijd het hele pakket (verslag + afbeeldingen) in één keer mailen.</div>
                </div>

                {/* ────────────────────────────────────
                    SECTIE B: CLUBWEBSITE
                ──────────────────────────────────── */}
                <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:20,padding:20,marginBottom:18}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:10,color:U,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase",opacity:0.9}}>Clubwebsite</span>
                    {clubWebsite && <span style={{fontSize:9,padding:"2px 7px",background:hex(U,0.18),border:`1px solid ${hex(U,0.35)}`,borderRadius:10,color:U,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>✓ Ingesteld</span>}
                  </div>
                  <div style={{fontSize:12,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.55,marginBottom:16}}>De URL van je clubwebsite. Wordt gebruikt in WhatsApp-deelteksten ("lees het volledige verslag op ...") en het verslag is na de wedstrijd kant-en-klaar te kopiëren als HTML voor in het CMS.</div>

                  <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginBottom:6}}>Website-URL</div>
                  <input
                    type="url"
                    value={clubWebsite}
                    onChange={e=>setClubWebsite(e.target.value)}
                    placeholder="https://www.vvonsdorp.nl"
                    style={INP}
                  />
                </div>

                {/* ────────────────────────────────────
                    SECTIE C: META-KOPPELING (BINNENKORT)
                ──────────────────────────────────── */}
                <div style={{background:"rgba(255,255,255,0.02)",border:`1px dashed ${T.border3}`,borderRadius:20,padding:20,marginBottom:18,position:"relative",opacity:0.85}}>
                  <div style={{position:"absolute",top:14,right:14,fontSize:9,padding:"3px 9px",background:"rgba(255,214,0,0.12)",border:"1px solid rgba(255,214,0,0.3)",borderRadius:10,color:"#ffd600",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:1.5,textTransform:"uppercase"}}>Binnenkort</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:18,lineHeight:1}}>🔗</span>
                    <span style={{fontSize:10,color:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:3,textTransform:"uppercase"}}>Direct posten op Facebook & Instagram</span>
                  </div>
                  <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:14}}>
                    Wanneer deze koppeling actief is, kan een SoMe-beheerder Matchly eenmalig toegang geven tot de Facebook-pagina en het Instagram Business-account. Daarna kunnen teammanagers direct vanuit de app publiceren — zonder inloggegevens te delen.
                  </div>
                  <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:12,marginBottom:14}}>
                    <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Voorwaarden</div>
                    {[
                      "Instagram-account moet een Business-account zijn",
                      "Gekoppeld aan een Facebook-pagina",
                      "Matchly door Meta App Review (lopend traject)",
                    ].map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:8,marginBottom:5,fontSize:11,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.5}}>
                        <span style={{color:T.text4}}>·</span><span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    disabled
                    style={{width:"100%",padding:13,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:12,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"not-allowed",letterSpacing:1,textTransform:"uppercase"}}
                  >
                    🔒 Koppeling nog niet beschikbaar
                  </button>
                </div>

                {/* ────────────────────────────────────
                    INFO BLOK
                ──────────────────────────────────── */}
                <div style={{background:`linear-gradient(135deg,${hex(U,0.06)},${hex(U,0.02)})`,border:`1px solid ${hex(U,0.18)}`,borderRadius:14,padding:14,marginBottom:24}}>
                  <div style={{fontSize:11,color:U,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>💡 Hoe werkt dit straks?</div>
                  <div style={{fontSize:11.5,color:T.text3,fontFamily:"Barlow,sans-serif",lineHeight:1.65}}>
                    Na de wedstrijd zie je op het output-scherm twee nieuwe blokken: <strong style={{color:T.text2}}>"Stuur naar SoMe-beheerder"</strong> bundelt alle social media-content in één WhatsApp-bericht, en <strong style={{color:T.text2}}>"Verslag voor de website"</strong> levert het verslag kant-en-klaar als HTML of platte tekst — direct te plakken in WordPress, Voetbalassist of Sportlink.
                  </div>
                </div>
              </>)}

            </>)}

          </div>

          {/* FOOTER */}
          <div style={{padding:"14px 20px",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:T.bg0,flexShrink:0}}>
            <span style={{fontSize:14,lineHeight:1}}>⚽</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:T.text4}}>Powered by</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:900,letterSpacing:2.5,textTransform:"uppercase",background:M.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Matchly</span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* WEDSTRIJDMOMENT TOEVOEGEN MODAL */}
      {addMoment && (
        <MomentSheet config={addMoment} liveMinute={elapsed} squad={activeSquad} C={U} clubName={clubName} onClose={()=>setAddMoment(null)}
          onAdd={(m)=>{setKeyMoments(p=>[...p,m]);setAddMoment(null);}} />
      )}
      {addSpecial && (
        <Sheet title={`${addSpecial.icon} ${addSpecial.label}`} onClose={()=>setAddSpecial(null)} accentColor={C}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif"}}>Kies de speler die dit betreft:</div>
            <PlayerSelect value={""} onChange={(p)=>{setSpecialInfo(prev=>[...prev,{type:addSpecial,player:p}]);setAddSpecial(null);}} squad={squad} placeholder="Speler..." />
          </div>
        </Sheet>
      )}

      {/* SPELBEELD BLOK REMINDER */}
      {blockReminder && (
        <div style={{position:"fixed",bottom:24,left:16,right:16,zIndex:280,background:`linear-gradient(135deg,${T.bg3},${T.bg2})`,border:`1px solid ${hex(U,0.4)}`,borderRadius:16,padding:14,boxShadow:`0 20px 50px rgba(0,0,0,0.7),0 0 30px ${hex(U,0.2)}`,animation:"slideUp 0.3s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:18}}>⚽</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,color:T.text,letterSpacing:0.5}}>Blok {blockReminder.label}' afgerond</div>
              <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",marginTop:1}}>Voeg eventuele momenten toe voor dit blok</div>
            </div>
            <button onClick={()=>setBlockReminder(null)} style={{background:"none",border:"none",color:T.text4,fontSize:20,cursor:"pointer",lineHeight:1}}>×</button>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setBlockReminder(null);setScreen("wedstrijdinfo");}} style={{flex:1.4,padding:"9px 8px",background:hex(U,0.15),border:`1px solid ${hex(U,0.35)}`,borderRadius:10,color:U,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:0.5,boxShadow:`0 0 10px ${hex(U,0.2)}`}}>➕ Moment</button>
            <button onClick={()=>{setBlockReminder(null);setScreen("spelbeeld");}} style={{flex:1,padding:"9px 8px",background:hex(U,0.08),border:`1px solid ${hex(U,0.2)}`,borderRadius:10,color:T.text3,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:0.5}}>📊 Spelbeeld</button>
            <button onClick={()=>setBlockReminder(null)} style={{flex:1,padding:"9px 8px",background:"transparent",border:`1px solid ${T.border3}`,borderRadius:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:0.5}}>⏭ Volgend</button>
          </div>
        </div>
      )}

      {modal==="GOAL"   && <GoalSheet type="GOAL"   onAdd={addEv} onClose={()=>setModal(null)} squad={activeSquad} C={U} liveMinute={elapsed} paused={paused} />}
      {modal==="OWN"    && <GoalSheet type="OWN"    onAdd={addEv} onClose={()=>setModal(null)} squad={activeSquad} C={U} liveMinute={elapsed} paused={paused} />}
      {modal==="YELLOW" && <CardSheet type="YELLOW" onAdd={addEv} onClose={()=>setModal(null)} squad={activeSquad} liveMinute={elapsed} paused={paused} opponent={opponent} openMoment={setAddMoment} />}
      {modal==="RED"    && <CardSheet type="RED"    onAdd={addEv} onClose={()=>setModal(null)} squad={activeSquad} liveMinute={elapsed} paused={paused} opponent={opponent} openMoment={setAddMoment} />}
      {modal==="RED_OPP" && <CardSheet type="RED"   onAdd={addEv} onClose={()=>setModal(null)} squad={activeSquad} liveMinute={elapsed} paused={paused} opponent={opponent} openMoment={setAddMoment} defaultOpponent />}
      {modal==="SUB"    && <SubSheet               onAdd={addEv} onClose={()=>setModal(null)} activeSquad={activeSquad} benchSquad={benchSquad} C={U} liveMinute={elapsed} paused={paused} />}
      {confirm && <ConfirmSheet message="Wedstrijd beëindigen en content genereren?" onConfirm={endMatch} onCancel={()=>setConfirm(false)} />}

      {/* DEMO PREVIEW MODAL */}
      {showDemo && (
        <div onClick={()=>setShowDemo(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:300,padding:"20px 16px",backdropFilter:"blur(16px)",overflowY:"auto"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:`linear-gradient(160deg,${T.bg3},${T.bg2})`,borderRadius:20,width:"100%",maxWidth:440,border:`1px solid ${T.border3}`,padding:20,marginTop:40,marginBottom:40}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,color:T.text,letterSpacing:0.5}}>👀 Voorbeeld van wat je krijgt</div>
              <button onClick={()=>setShowDemo(false)} style={{background:"none",border:"none",color:T.text4,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
            </div>
            <div style={{fontSize:12,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginBottom:16}}>Na elke wedstrijd genereert Matchly automatisch 5 content-formats. Hier zie je hoe de match post eruit ziet met voorbeelddata:</div>
            <div ref={null} style={{width:"100%",aspectRatio:"1/1",position:"relative",background:TBG,fontFamily:"'Barlow Condensed',sans-serif",overflow:"hidden",borderRadius:14}}>
              {renderPattern(1)}
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3% 4% 0",flexShrink:0}}>
                  <span style={{fontSize:"2.8%",fontWeight:900,letterSpacing:2,color:`${TAC}cc`,textTransform:"uppercase"}}>Heren 1</span>
                  <span style={{fontSize:"2.2%",color:"rgba(255,255,255,0.2)"}}>powered by Matchly</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"2% 5% 0",flexShrink:0}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1.5%",flex:1}}>
                    <div style={{width:"16%",aspectRatio:"1/1",background:thex(TAC,0.2),border:`2px solid ${thex(TAC,0.4)}`,borderRadius:"12%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"5.5%",fontWeight:900,color:TAC}}>VV</div>
                    <span style={{fontSize:"3.2%",fontWeight:900,color:"#fff",textAlign:"center",lineHeight:1.2}}>Jouw Club</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"1%",flex:"0 0 auto"}}>
                    <span style={{fontSize:"26%",fontWeight:900,color:"#fff",lineHeight:1,textShadow:`0 0 40px ${thex(TAC,0.7)}`}}>3</span>
                    <span style={{fontSize:"7%",color:"rgba(255,255,255,0.2)",marginTop:"-3%"}}>–</span>
                    <span style={{fontSize:"20%",fontWeight:900,color:"rgba(255,255,255,0.4)",lineHeight:1}}>2</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1.5%",flex:1}}>
                    <div style={{width:"16%",aspectRatio:"1/1",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"12%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"5.5%",fontWeight:900,color:"rgba(255,255,255,0.4)"}}>TG</div>
                    <span style={{fontSize:"3.2%",fontWeight:900,color:"rgba(255,255,255,0.5)",textAlign:"center",lineHeight:1.2}}>Tegenstander</span>
                  </div>
                </div>
                <div style={{textAlign:"center",padding:"1.5% 4% 0",flexShrink:0}}>
                  <span style={{fontSize:"4.2%",fontWeight:900,fontStyle:"italic",textTransform:"uppercase",lineHeight:1.15,color:"#fff",display:"block"}}>"Karakter brengt drie punten op karakter"</span>
                </div>
                <div style={{display:"flex",padding:"2% 4% 0",gap:"3%",flex:1,minHeight:0}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"2.5%",fontWeight:900,letterSpacing:2,color:`${TAC}cc`,textTransform:"uppercase",marginBottom:"1.5%"}}>Doelpunten</div>
                    {[["12'","Speler 1","1-0"],["51'","Speler 2","2-1"],["89'","Speler 3","3-2"]].map(([m,p,s],i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",marginBottom:"1.8%",gap:"2%"}}>
                        <span style={{fontSize:"2.8%",color:`${TAC}cc`,fontWeight:900,width:"10%",textAlign:"right"}}>{m}</span>
                        <span style={{fontSize:"2.8%",color:"rgba(255,255,255,0.82)",flex:1,fontWeight:600}}>{p}</span>
                        <span style={{fontSize:"2%",color:thex(TAC,0.85),fontWeight:800,background:thex(TAC,0.12),padding:"0.4% 1.2%",borderRadius:"3px"}}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{width:"22%",display:"flex",flexDirection:"column",alignItems:"center",gap:"3%"}}>
                    <div style={{fontSize:"2.2%",fontWeight:900,letterSpacing:1.5,color:`${TAC2}bb`,textTransform:"uppercase",textAlign:"center"}}>MOTM</div>
                    <div style={{background:thex(TAC,0.1),border:`1px solid ${thex(TAC,0.25)}`,borderRadius:"10%",padding:"4% 3%",textAlign:"center",width:"100%"}}>
                      <div style={{fontSize:"6%",marginBottom:"3%"}}>🏆</div>
                      <div style={{fontSize:"2.8%",fontWeight:900,color:"#fff",lineHeight:1.2}}>Speler 3</div>
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"2.5%",fontWeight:900,letterSpacing:1.5,color:`${TAC}cc`,textTransform:"uppercase",marginBottom:"1%"}}>In het kort</div>
                    <p style={{fontSize:"2.6%",color:"rgba(255,255,255,0.82)",lineHeight:1.55,margin:0}}>Na een sterke openingsfase liep Jouw Club tegen een gelijkmaker aan. In de slotfase werd het 3-2 door de man of the match.</p>
                  </div>
                </div>
                <div style={{background:"rgba(0,0,0,0.55)",borderTop:`3px solid ${TAC}`,marginTop:"auto",padding:"2% 3%"}}>
                  <div style={{fontSize:"2%",fontWeight:900,letterSpacing:2,color:"rgba(255,255,255,0.2)",textTransform:"uppercase",textAlign:"center",marginBottom:"1%"}}>Mede mogelijk gemaakt door onze trouwe sponsors</div>
                  <div style={{display:"flex",gap:"2%",justifyContent:"center"}}>
                    {["Sponsor 1","Sponsor 2","Sponsor 3"].map((s,i)=><div key={i} style={{flex:1,background:"#e8e8e8",borderRadius:"6%",padding:"1% 2%",maxWidth:"22%",textAlign:"center"}}><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"75%",fontWeight:900,color:"#222"}}>{s}</span></div>)}
                  </div>
                </div>
              </div>
            </div>
            <div style={{fontSize:11,color:T.text4,fontFamily:"Barlow,sans-serif",lineHeight:1.6,marginTop:14}}>+ 4 andere formats: MOTM post, Story, Verslag voor website, WhatsApp-bericht — allemaal in dezelfde stijl met je eigen kleuren en logo's.</div>
            <button onClick={()=>setShowDemo(false)} style={{marginTop:14,width:"100%",padding:"12px",background:M.gradD,border:"none",borderRadius:100,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:900,cursor:"pointer",letterSpacing:0.5,boxShadow:`0 6px 20px ${hex(M.purple,0.4)}`}}>Aan de slag</button>
          </div>
        </div>
      )}

      {/* TEAM ID INFO MODAL */}
      {showTeamIdInfo && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"20px 16px",backdropFilter:"blur(16px)"}}>
          <div style={{background:`linear-gradient(160deg,${T.bg3},${T.bg2})`,borderRadius:24,width:"100%",maxWidth:400,border:`1px solid ${T.border3}`,boxShadow:"0 40px 80px rgba(0,0,0,0.8)"}}>
            <div style={{height:3,background:`linear-gradient(90deg,${U},transparent)`,borderRadius:"24px 24px 0 0"}} />
            <div style={{padding:"20px 24px 28px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:T.text}}>Waar vind je het team-ID?</span>
                <button onClick={()=>setShowTeamIdInfo(false)} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border3}`,borderRadius:10,width:32,height:32,color:T.text3,cursor:"pointer",fontSize:16}}>✕</button>
              </div>
              {[["1","Ga naar","voetbal.nl"],["2","Zoek je club","via de zoekbalk bovenin"],["3","Klik op jouw team","bijv. 'VV Ons Dorp Heren 2'"],["4","Kijk in de URL","het nummer ná /team/ is jouw ID"]].map(([nr,bold,rest])=>(
                <div key={nr} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
                  <div style={{width:26,height:26,borderRadius:8,background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:900,color:U,flexShrink:0}}>{nr}</div>
                  <div style={{fontFamily:"Barlow,sans-serif",fontSize:14,color:T.text3,lineHeight:1.5}}><strong style={{color:T.text}}>{bold}</strong> {rest}</div>
                </div>
              ))}
              <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border2}`,borderRadius:12,padding:"12px 14px",marginTop:4}}>
                <div style={{fontSize:10,color:T.text4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,marginBottom:6}}>VOORBEELD URL</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:T.text3,lineHeight:1.7,wordBreak:"break-all"}}>voetbal.nl/teams/nederland/team/<span style={{color:U,fontWeight:700}}>122561</span>/show/</div>
              </div>
              <button onClick={()=>setShowTeamIdInfo(false)} style={{width:"100%",marginTop:20,padding:"13px",background:hex(U,0.15),border:`1px solid ${hex(U,0.3)}`,borderRadius:14,color:U,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:800,letterSpacing:0.5}}>Begrepen</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
