# ChemLabs

Notable features

w(inp: string):
Takes an input string query and creates a substance out of it
Input String Query can effectively be divided into to parts:
Formula recognizer and Quantity recognizer.
These two components can be placed in any order. For example, 
'H2O 5mL' and '5mL H2O' are equally valid.
for example, w('H2O 5mL') will create a substance of water with 5mL
Quantities:
acceptable base_units are ['g','L','mol','M','m', 'J', 'V', 'W-h', 'atm']
, which can be combined with any si-_prefix in  ['n', 'µ','m','c','d','k']


Spectral info to RGB
Let a function f(wl) be such that for any given wavelength `wl` f(wl) will
return the relative spectral specific intensity

Then to find the rgb color corresponding to a specific spectrum, simply do
rgb_from_spectrum(f);

But note. A misconception is that white light is
an even mix of all wavelengths, when actually there are certain wavelengths
like green/blue that are more prevalent in what is perceived as pure white.
For convenience a function f_daylight(wl) is provided that produces a
fairly white color on (at least one) display screen. 

f_daylight is loosely modeled on these 2 sources for spectral info for daylight
[s1](https://en.wikipedia.org/wiki/Sunlight#/media/File:Solar_spectrum_en.svg)
[s2](https://www.researchgate.net/figure/Spectral-distribution-of-natural-sunlight-in-San-Marcos-TX-at-noon-top-A-and-Phillips_fig1_339457060);
and is pretty savagely approximated with 2 lines: 

Suppose the naive way of simply plugging in transmittance:
`rgb_from_spectrum(x => transmittance(spectra_f(x), c));`
setting it at 0 concentration yields a very noticable pinkish hue.

Because transmittance is the ratio of light that passes through a substance
(as opposed to the light that gets absorbed.)
Since the mixture of light that enters the substance is an uneven mix,
(such as that shown by f_daylight)
we need to multiply that by the transmittance, because the transmittance
only tells us the portion of light that passes through.

Thus,
let n = rgb_from_spectrum(x => f_daylight(x) * transmittance(spectra_f(x), concen));
or rgb_from_spectrum_concen(spectra_f, concen) will yield the desired results.



